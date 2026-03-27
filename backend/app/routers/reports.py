from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_nda_signed
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportOut

router = APIRouter(prefix="/projects/{project_id}/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportOut,
    status_code=201,
    summary="Создать репорт",
    description="Создаёт новый репорт в проекте. Требуется подписанный NDA.",
)
async def create_report(
    project_id: int,
    data: ReportCreate,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    report = Report(
        project_id=project_id,
        title=data.title,
        content=data.content,
        author_id=user.id,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get(
    "",
    response_model=list[ReportOut],
    summary="Список репортов проекта",
    description="Возвращает все репорты проекта. Требуется подписанный NDA.",
)
async def list_reports(
    project_id: int,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).where(Report.project_id == project_id).order_by(Report.created_at.desc())
    )
    return result.scalars().all()
