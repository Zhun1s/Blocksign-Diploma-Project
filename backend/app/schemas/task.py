from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import CamelModel


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    deadline: datetime | None = None
    important: bool = False
    assignee_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    deadline: datetime | None = None
    important: bool | None = None
    assignee_id: int | None = None


class TaskOut(CamelModel):
    id: int
    title: str
    description: str | None
    status: str
    important: bool
    deadline: datetime | None
    project_id: int
    assignee_id: int | None
    created_at: datetime
