import base64
import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.project import Project, ProjectMember
from app.models.qr_token import QRToken
from app.schemas.nda import NDASignRequest, NDASignResponse
from app.services.ipfs import upload_to_ipfs
from app.services.blockchain import store_nda_hash_on_chain, verify_nda_on_chain

router = APIRouter(prefix="/projects/{project_id}", tags=["NDA"])


@router.get(
    "/nda-access",
    summary="Страница NDA",
    description="Валидирует QR-токен и возвращает информацию о проекте и NDA (IPFS hash). Не требует JWT.",
)
async def nda_access(
    project_id: int,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    qr = await _validate_token(db, token, project_id)
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "project_name": project.name,
        "nda_ipfs_hash": project.nda_ipfs_hash,
        "user_id": qr.user_id,
    }


@router.post(
    "/nda-sign",
    response_model=NDASignResponse,
    summary="Подписать NDA",
    description=(
        "Полный flow подписания NDA:\n"
        "1. Валидация QR-токена\n"
        "2. Загрузка изображения подписи в IPFS\n"
        "3. Вычисление SHA-256(NDA hash + подпись + timestamp)\n"
        "4. Отправка хеша в smart contract Polygon\n"
        "5. Обновление nda_signed = true\n"
        "6. Пометка токена как использованного"
    ),
)
async def sign_nda(
    project_id: int,
    data: NDASignRequest,
    db: AsyncSession = Depends(get_db),
):
    qr = await _validate_token(db, data.token, project_id)
    if qr.user_id is None:
        raise HTTPException(status_code=400, detail="Invite is not claimed yet")

    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Decode and upload signature image to IPFS
    try:
        sig_bytes = base64.b64decode(data.signature_image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 signature")

    sig_ipfs_hash = await upload_to_ipfs(sig_bytes, "signature.png")

    # Compute combined hash
    timestamp = datetime.now(timezone.utc).isoformat()
    combined = f"{project.nda_ipfs_hash or ''}{sig_ipfs_hash}{timestamp}"
    nda_hash = hashlib.sha256(combined.encode()).hexdigest()

    # Store on blockchain (relayer: server pays gas, userId stored in contract)
    tx_hash = None
    try:
        tx_hash = await store_nda_hash_on_chain(project_id, qr.user_id, nda_hash)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Blockchain tx failed (NDA still signed): %s", e)

    # Update member
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == qr.user_id,
        )
    )
    member = result.scalar_one_or_none()
    if member:
        member.nda_signed = True

    # Mark token used
    qr.used = True
    await db.commit()

    return NDASignResponse(
        message="NDA signed successfully",
        ipfs_hash=sig_ipfs_hash,
        nda_hash=nda_hash,
        tx_hash=tx_hash,
    )


@router.get(
    "/nda-verify",
    summary="Верификация NDA через блокчейн",
    description="Читает запись NDA из smart contract Polygon по user_id и возвращает хеш, timestamp и userId подписанта.",
)
async def verify_nda(
    project_id: int,
    user_id: int,
):
    record = await verify_nda_on_chain(project_id, user_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail="NDA record not found on chain (blockchain may not be configured)",
        )
    return record


async def _validate_token(db: AsyncSession, token: str, project_id: int) -> QRToken:
    result = await db.execute(select(QRToken).where(QRToken.token == token))
    qr = result.scalar_one_or_none()

    if not qr:
        raise HTTPException(status_code=404, detail="Invalid token")
    if qr.project_id != project_id:
        raise HTTPException(status_code=400, detail="Token does not match project")
    if qr.used:
        raise HTTPException(status_code=400, detail="Token already used")
    expires = qr.expires_at if qr.expires_at.tzinfo else qr.expires_at.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")

    return qr
