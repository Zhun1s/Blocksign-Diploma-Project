from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import CamelModel


class ReportCreate(BaseModel):
    title: str
    content: str


class ReportOut(CamelModel):
    id: int
    project_id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
