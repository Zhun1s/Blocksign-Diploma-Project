import pytest
from httpx import AsyncClient

from app.models.project import Project


@pytest.mark.asyncio
async def test_create_project(client: AsyncClient, auth_headers):
    resp = await client.post("/projects", json={
        "name": "My Project",
        "description": "A cool project",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Project"
    assert data["description"] == "A cool project"


@pytest.mark.asyncio
async def test_create_project_with_nda(client: AsyncClient, auth_headers, mock_ipfs):
    resp = await client.post("/projects", json={
        "name": "NDA Project",
        "nda_text": "This is an NDA document.",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["ndaIpfsHash"] == "QmTestHash123"
    mock_ipfs.assert_called_once()


@pytest.mark.asyncio
async def test_create_project_unauthorized(client: AsyncClient):
    resp = await client.post("/projects", json={"name": "Fail"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient, auth_headers, test_project):
    resp = await client.get("/projects", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Project"


@pytest.mark.asyncio
async def test_get_project(client: AsyncClient, auth_headers, test_project):
    resp = await client.get(f"/projects/{test_project.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Project"


@pytest.mark.asyncio
async def test_get_project_not_member(client: AsyncClient, test_project, second_user):
    from app.services.auth import create_access_token
    token = create_access_token({"sub": second_user.id})
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.get(f"/projects/{test_project.id}", headers=headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_invite_user(client: AsyncClient, auth_headers, test_project, second_user):
    resp = await client.post(
        f"/projects/{test_project.id}/invite",
        json={"role": "member"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data


@pytest.mark.asyncio
async def test_claim_invite(client: AsyncClient, auth_headers, test_project):
    invite_resp = await client.post(
        f"/projects/{test_project.id}/invite",
        json={"role": "member"},
        headers=auth_headers,
    )
    assert invite_resp.status_code == 200
    token = invite_resp.json()["token"]

    resp = await client.post(
        f"/projects/{test_project.id}/invite/claim",
        json={"token": token},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "already a member" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_claim_invite_for_second_user(
    client: AsyncClient, auth_headers, test_project, second_user
):
    invite_resp = await client.post(
        f"/projects/{test_project.id}/invite",
        json={"role": "member"},
        headers=auth_headers,
    )
    assert invite_resp.status_code == 200
    token = invite_resp.json()["token"]

    from app.services.auth import create_access_token
    second_headers = {"Authorization": f"Bearer {create_access_token({'sub': second_user.id})}"}

    resp = await client.post(
        f"/projects/{test_project.id}/invite/claim",
        json={"token": token},
        headers=second_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["user_id"] == second_user.id


@pytest.mark.asyncio
async def test_invite_already_member(
    client: AsyncClient, auth_headers, test_project, invited_member
):
    resp = await client.post(
        f"/projects/{test_project.id}/invite/claim",
        json={"token": "test-qr-token-123"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "already a member" in resp.json()["detail"]
