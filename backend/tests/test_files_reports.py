import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import ProjectMember
from app.models.user import User
from app.services.auth import create_access_token


@pytest.mark.asyncio
async def test_upload_file(client: AsyncClient, auth_headers, test_project):
    resp = await client.post(
        f"/projects/{test_project.id}/files",
        headers=auth_headers,
        files={"file": ("test.txt", b"hello world", "text/plain")},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["fileName"] == "test.txt"
    assert data["ipfsHash"] == "QmTestHash123"


@pytest.mark.asyncio
async def test_upload_file_nda_not_signed(
    client: AsyncClient, test_project, second_user, invited_member
):
    token = create_access_token({"sub": second_user.id})
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post(
        f"/projects/{test_project.id}/files",
        headers=headers,
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert resp.status_code == 403
    assert "NDA not signed" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_list_files(client: AsyncClient, auth_headers, test_project):
    # Upload first
    await client.post(
        f"/projects/{test_project.id}/files",
        headers=auth_headers,
        files={"file": ("a.txt", b"aaa", "text/plain")},
    )
    resp = await client.get(
        f"/projects/{test_project.id}/files", headers=auth_headers
    )
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_create_report(client: AsyncClient, auth_headers, test_project):
    resp = await client.post(
        f"/projects/{test_project.id}/reports",
        headers=auth_headers,
        json={"title": "Weekly Report", "content": "Everything is fine."},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Weekly Report"
    assert data["content"] == "Everything is fine."


@pytest.mark.asyncio
async def test_create_report_nda_not_signed(
    client: AsyncClient, test_project, second_user, invited_member
):
    token = create_access_token({"sub": second_user.id})
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post(
        f"/projects/{test_project.id}/reports",
        headers=headers,
        json={"title": "Fail", "content": "Should not work"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_reports(client: AsyncClient, auth_headers, test_project):
    await client.post(
        f"/projects/{test_project.id}/reports",
        headers=auth_headers,
        json={"title": "Report 1", "content": "Content 1"},
    )
    resp = await client.get(
        f"/projects/{test_project.id}/reports", headers=auth_headers
    )
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_file_access_not_member(client: AsyncClient, test_project):
    # No auth at all
    resp = await client.get(f"/projects/{test_project.id}/files")
    assert resp.status_code == 403
