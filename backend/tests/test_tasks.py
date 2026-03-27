import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


@pytest.mark.asyncio
async def test_create_task(client: AsyncClient, test_project, auth_headers):
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Design landing page", "description": "Figma mockup", "important": True},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Design landing page"
    assert data["description"] == "Figma mockup"
    assert data["status"] == "not_started"
    assert data["important"] is True
    assert data["projectId"] == test_project.id
    assert data["assigneeId"] is None


@pytest.mark.asyncio
async def test_create_task_minimal(client: AsyncClient, test_project, auth_headers):
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Quick task"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Quick task"
    assert data["important"] is False
    assert data["status"] == "not_started"


@pytest.mark.asyncio
async def test_create_task_nda_not_signed(
    client: AsyncClient, test_project, invited_member, second_user
):
    from app.services.auth import create_access_token

    token = create_access_token({"sub": second_user.id})
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Should fail"},
        headers=headers,
    )
    assert resp.status_code == 403
    assert "NDA" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_list_tasks(client: AsyncClient, test_project, auth_headers):
    # Create a few tasks
    for title in ["Task A", "Task B", "Task C"]:
        await client.post(
            f"/projects/{test_project.id}/tasks",
            json={"title": title},
            headers=auth_headers,
        )

    resp = await client.get(
        f"/projects/{test_project.id}/tasks",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3


@pytest.mark.asyncio
async def test_list_tasks_filter_status(client: AsyncClient, test_project, auth_headers):
    # Create two tasks, update one to in_progress
    resp1 = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Todo task"},
        headers=auth_headers,
    )
    resp2 = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Active task"},
        headers=auth_headers,
    )
    task_id = resp2.json()["id"]
    await client.patch(
        f"/projects/{test_project.id}/tasks/{task_id}",
        json={"status": "in_progress"},
        headers=auth_headers,
    )

    # Filter by status
    resp = await client.get(
        f"/projects/{test_project.id}/tasks",
        params={"status": "in_progress"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Active task"


@pytest.mark.asyncio
async def test_list_tasks_filter_important(client: AsyncClient, test_project, auth_headers):
    await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Normal task", "important": False},
        headers=auth_headers,
    )
    await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Urgent task", "important": True},
        headers=auth_headers,
    )

    resp = await client.get(
        f"/projects/{test_project.id}/tasks",
        params={"important": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Urgent task"


@pytest.mark.asyncio
async def test_update_task(client: AsyncClient, test_project, auth_headers):
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Original title"},
        headers=auth_headers,
    )
    task_id = resp.json()["id"]

    resp = await client.patch(
        f"/projects/{test_project.id}/tasks/{task_id}",
        json={"title": "Updated title", "status": "done", "important": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Updated title"
    assert data["status"] == "done"
    assert data["important"] is True


@pytest.mark.asyncio
async def test_update_task_invalid_status(client: AsyncClient, test_project, auth_headers):
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "Test"},
        headers=auth_headers,
    )
    task_id = resp.json()["id"]

    resp = await client.patch(
        f"/projects/{test_project.id}/tasks/{task_id}",
        json={"status": "invalid_status"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "Invalid status" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_update_task_not_found(client: AsyncClient, test_project, auth_headers):
    resp = await client.patch(
        f"/projects/{test_project.id}/tasks/9999",
        json={"title": "Nope"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_task(client: AsyncClient, test_project, auth_headers):
    resp = await client.post(
        f"/projects/{test_project.id}/tasks",
        json={"title": "To delete"},
        headers=auth_headers,
    )
    task_id = resp.json()["id"]

    resp = await client.delete(
        f"/projects/{test_project.id}/tasks/{task_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 204

    # Verify deleted
    resp = await client.get(
        f"/projects/{test_project.id}/tasks",
        headers=auth_headers,
    )
    assert len(resp.json()) == 0


@pytest.mark.asyncio
async def test_delete_task_not_found(client: AsyncClient, test_project, auth_headers):
    resp = await client.delete(
        f"/projects/{test_project.id}/tasks/9999",
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_task_not_accessible_to_non_member(client: AsyncClient, test_project, second_user):
    from app.services.auth import create_access_token

    token = create_access_token({"sub": second_user.id})
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get(
        f"/projects/{test_project.id}/tasks",
        headers=headers,
    )
    assert resp.status_code == 403
