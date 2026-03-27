from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_nda_signed
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Tasks"])

VALID_STATUSES = {"not_started", "in_progress", "done", "missed"}


@router.get(
    "",
    response_model=list[TaskOut],
    summary="Список задач проекта",
    description="Возвращает задачи проекта. Можно фильтровать по status и important. Доступно только участникам с подписанным NDA.",
)
async def list_tasks(
    project_id: int,
    status_filter: str | None = Query(None, alias="status"),
    important: bool | None = None,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    query = select(Task).where(Task.project_id == project_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    if important is not None:
        query = query.where(Task.important == important)
    query = query.order_by(Task.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post(
    "",
    response_model=TaskOut,
    status_code=status.HTTP_201_CREATED,
    summary="Создать задачу",
    description="Создаёт новую задачу в проекте. Доступно только участникам с подписанным NDA.",
)
async def create_task(
    project_id: int,
    data: TaskCreate,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    deadline = data.deadline
    if deadline and deadline.tzinfo is not None:
        deadline = deadline.replace(tzinfo=None)

    task = Task(
        title=data.title,
        description=data.description,
        deadline=deadline,
        important=data.important,
        assignee_id=data.assignee_id,
        project_id=project_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.patch(
    "/{task_id}",
    response_model=TaskOut,
    summary="Обновить задачу",
    description="Обновляет поля задачи (title, description, status, deadline, important, assignee_id). Доступно только участникам с подписанным NDA.",
)
async def update_task(
    project_id: int,
    task_id: int,
    data: TaskUpdate,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task(db, project_id, task_id)

    updates = data.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")

    if "deadline" in updates and updates["deadline"] is not None:
        dl = updates["deadline"]
        if hasattr(dl, "tzinfo") and dl.tzinfo is not None:
            updates["deadline"] = dl.replace(tzinfo=None)

    for field, value in updates.items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить задачу",
    description="Удаляет задачу из проекта. Доступно только участникам с подписанным NDA.",
)
async def delete_task(
    project_id: int,
    task_id: int,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    task = await _get_task(db, project_id, task_id)
    await db.delete(task)
    await db.commit()


async def _get_task(db: AsyncSession, project_id: int, task_id: int) -> Task:
    result = await db.execute(
        select(Task).where(Task.project_id == project_id, Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
