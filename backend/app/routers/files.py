from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_nda_signed
from app.models.user import User
from app.models.file import File
from app.schemas.file import FileOut
from app.services.ipfs import upload_to_ipfs

router = APIRouter(prefix="/projects/{project_id}/files", tags=["Files"])


@router.post(
    "",
    response_model=FileOut,
    status_code=201,
    summary="Загрузить файл",
    description="Загружает файл в IPFS и сохраняет метаданные. Требуется подписанный NDA.",
)
async def upload_file(
    project_id: int,
    file: UploadFile = FastAPIFile(...),
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    contents = await file.read()
    ipfs_hash = await upload_to_ipfs(contents, file.filename or "file")

    db_file = File(
        project_id=project_id,
        file_name=file.filename or "file",
        ipfs_hash=ipfs_hash,
        file_size=len(contents),
        uploaded_by=user.id,
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file


@router.get(
    "",
    response_model=list[FileOut],
    summary="Список файлов проекта",
    description="Возвращает все файлы проекта. Требуется подписанный NDA.",
)
async def list_files(
    project_id: int,
    user: User = Depends(require_nda_signed),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(File).where(File.project_id == project_id).order_by(File.created_at.desc())
    )
    return result.scalars().all()
