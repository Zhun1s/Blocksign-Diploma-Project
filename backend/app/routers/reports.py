from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_nda_signed
from app.models.user import User
from app.models.report import Report, ReportComment, ReportAttachment
from app.schemas.report import (
    ReportCreate, ReportOut, ReportDetailOut,
    CommentCreate, CommentOut, AttachmentOut,
)
from app.services.ipfs import upload_to_ipfs

router = APIRouter(prefix="/projects/{project_id}/reports", tags=["Reports"])


@router.post("", response_model=ReportOut, status_code=201)
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


@router.get("", response_model=list[ReportOut])
async def list_reports(
    project_id: int,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).where(Report.project_id == project_id).order_by(Report.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{report_id}", response_model=ReportDetailOut)
async def get_report(
    project_id: int,
    report_id: int,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.comments), selectinload(Report.attachments))
        .where(Report.project_id == project_id, Report.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/comments", response_model=CommentOut, status_code=201)
async def add_comment(
    project_id: int,
    report_id: int,
    data: CommentCreate,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).where(Report.project_id == project_id, Report.id == report_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Report not found")

    comment = ReportComment(report_id=report_id, author_id=user.id, text=data.text)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


@router.post("/{report_id}/attachments", response_model=AttachmentOut, status_code=201)
async def add_attachment(
    project_id: int,
    report_id: int,
    file: UploadFile = FastAPIFile(...),
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).where(Report.project_id == project_id, Report.id == report_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Report not found")

    contents = await file.read()
    file_name = file.filename or "file"
    ipfs_hash = await upload_to_ipfs(contents, file_name)

    attachment = ReportAttachment(
        report_id=report_id,
        file_name=file_name,
        ipfs_hash=ipfs_hash,
        file_size=len(contents),
        uploaded_by=user.id,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment
