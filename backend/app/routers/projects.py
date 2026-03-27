import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.models.qr_token import QRToken
from app.schemas.project import (
    ProjectCreate,
    ProjectOut,
    ProjectMemberDetailOut,
    InviteRequest,
    InviteClaimRequest,
)
from app.services.ipfs import upload_to_ipfs

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post(
    "",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    summary="Создать проект",
    description="Создаёт новый проект. Если передан nda_text — загружает NDA в IPFS. Создатель автоматически становится owner с подписанным NDA.",
)
async def create_project(
    data: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    nda_hash = None
    if data.nda_text:
        nda_hash = await upload_to_ipfs(data.nda_text.encode(), "nda.txt")

    project = Project(
        name=data.name,
        description=data.description,
        company=data.company,
        owner_id=user.id,
        nda_ipfs_hash=nda_hash,
    )
    db.add(project)
    await db.flush()

    # Owner is automatically a member with nda_signed=True
    member = ProjectMember(
        project_id=project.id, user_id=user.id, role="owner", nda_signed=True
    )
    db.add(member)
    await db.commit()
    await db.refresh(project)
    return project


@router.get(
    "",
    response_model=list[ProjectOut],
    summary="Список проектов",
    description="Возвращает все проекты, в которых текущий пользователь является участником.",
)
async def list_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project)
        .join(ProjectMember)
        .where(ProjectMember.user_id == user.id)
    )
    return result.scalars().all()


@router.get(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Детали проекта",
    description="Возвращает информацию о проекте. Доступно только участникам.",
)
async def get_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check membership
    mem = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    if not mem.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a project member")

    return project


@router.post(
    "/{project_id}/invite",
    summary="Пригласить пользователя",
    description="Генерирует одноразовый QR-токен (24ч) для приглашения в проект. Доступно только owner/manager.",
)
async def invite_user(
    project_id: int,
    data: InviteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check caller is owner or manager
    mem_result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    caller_member = mem_result.scalar_one_or_none()
    if not caller_member or caller_member.role not in ("owner", "manager"):
        raise HTTPException(status_code=403, detail="Only owner/manager can invite")

    # Generate QR token
    token_value = secrets.token_urlsafe(32)
    qr_token = QRToken(
        token=token_value,
        project_id=project_id,
        user_id=None,
        role=data.role,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=24),
    )
    db.add(qr_token)
    await db.commit()

    return {"token": token_value, "message": "Invite token generated"}


@router.post(
    "/{project_id}/invite/claim",
    summary="Принять приглашение",
    description="Привязывает QR-токен приглашения к текущему пользователю и добавляет его в проект как участника.",
)
async def claim_invite(
    project_id: int,
    data: InviteClaimRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = data.token

    qr_result = await db.execute(select(QRToken).where(QRToken.token == token))
    qr = qr_result.scalar_one_or_none()

    if not qr:
        raise HTTPException(status_code=404, detail="Invalid token")
    if qr.project_id != project_id:
        raise HTTPException(status_code=400, detail="Token does not match project")
    if qr.used:
        raise HTTPException(status_code=400, detail="Token already used")

    expires = qr.expires_at if qr.expires_at.tzinfo else qr.expires_at.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")

    if qr.user_id is not None and qr.user_id != user.id:
        raise HTTPException(status_code=403, detail="Token already claimed by another user")

    existing = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already a member")

    qr.user_id = user.id
    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=qr.role,
    )
    db.add(member)
    await db.commit()

    return {
        "message": "Invite claimed successfully",
        "project_id": project_id,
        "user_id": user.id,
    }


@router.get(
    "/{project_id}/members",
    response_model=list[ProjectMemberDetailOut],
    summary="Список участников проекта",
    description="Возвращает участников проекта с полными данными пользователя (имя, email). Доступно только участникам.",
)
async def list_members(
    project_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check caller is a member
    mem = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    if not mem.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a project member")

    result = await db.execute(
        select(ProjectMember)
        .options(selectinload(ProjectMember.user))
        .where(ProjectMember.project_id == project_id)
    )
    members = result.scalars().all()

    return [
        ProjectMemberDetailOut(
            user_id=m.user_id,
            full_name=m.user.full_name,
            email=m.user.email,
            role=m.role,
            nda_signed=m.nda_signed,
        )
        for m in members
    ]
