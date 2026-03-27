import base64
from datetime import datetime, timedelta, UTC

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import ProjectMember
from app.models.qr_token import QRToken


@pytest.mark.asyncio
async def test_nda_access(client: AsyncClient, test_project, invited_member):
    resp = await client.get(
        f"/projects/{test_project.id}/nda-access",
        params={"token": "test-qr-token-123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["project_name"] == "Test Project"


@pytest.mark.asyncio
async def test_nda_access_invalid_token(client: AsyncClient, test_project):
    resp = await client.get(
        f"/projects/{test_project.id}/nda-access",
        params={"token": "invalid-token"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_nda_sign(
    client: AsyncClient, test_project, invited_member, db_session: AsyncSession
):
    sig = base64.b64encode(b"fake-signature-image").decode()
    resp = await client.post(
        f"/projects/{test_project.id}/nda-sign",
        json={"token": "test-qr-token-123", "signature_image_base64": sig},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "NDA signed successfully"
    assert data["ipfsHash"] == "QmTestHash123"
    assert len(data["ndaHash"]) == 64  # SHA256 hex
    assert data["txHash"] == "0xfaketxhash"

    # Verify member nda_signed is True
    member_obj, _ = invited_member
    pid = test_project.id
    uid = member_obj.user_id
    db_session.expire_all()
    result = await db_session.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == pid,
            ProjectMember.user_id == uid,
        )
    )
    member = result.scalar_one()
    assert member.nda_signed is True

    # Verify token is used
    result = await db_session.execute(
        select(QRToken).where(QRToken.token == "test-qr-token-123")
    )
    qr = result.scalar_one()
    assert qr.used is True


@pytest.mark.asyncio
async def test_nda_sign_used_token(client: AsyncClient, test_project, invited_member):
    sig = base64.b64encode(b"sig").decode()
    # First sign
    await client.post(
        f"/projects/{test_project.id}/nda-sign",
        json={"token": "test-qr-token-123", "signature_image_base64": sig},
    )
    # Second attempt with same token
    resp = await client.post(
        f"/projects/{test_project.id}/nda-sign",
        json={"token": "test-qr-token-123", "signature_image_base64": sig},
    )
    assert resp.status_code == 400
    assert "already used" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_nda_sign_expired_token(
    client: AsyncClient, test_project, second_user, db_session: AsyncSession
):
    # Create expired token
    member = ProjectMember(
        project_id=test_project.id, user_id=second_user.id, role="member"
    )
    db_session.add(member)
    expired_qr = QRToken(
        token="expired-token",
        project_id=test_project.id,
        user_id=second_user.id,
        expires_at=datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=1),
    )
    db_session.add(expired_qr)
    await db_session.commit()

    sig = base64.b64encode(b"sig").decode()
    resp = await client.post(
        f"/projects/{test_project.id}/nda-sign",
        json={"token": "expired-token", "signature_image_base64": sig},
    )
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_nda_sign_wrong_project_token(client: AsyncClient, test_project, invited_member):
    sig = base64.b64encode(b"sig").decode()
    # Use valid token but wrong project_id
    resp = await client.post(
        "/projects/9999/nda-sign",
        json={"token": "test-qr-token-123", "signature_image_base64": sig},
    )
    assert resp.status_code == 400
