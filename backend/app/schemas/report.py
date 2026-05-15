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


class CommentCreate(BaseModel):
    text: str


class CommentOut(CamelModel):
    id: int
    report_id: int
    author_id: int
    text: str
    created_at: datetime


class AttachmentOut(CamelModel):
    id: int
    report_id: int
    file_name: str
    ipfs_hash: str
    file_size: int | None
    uploaded_by: int
    created_at: datetime


class ReportDetailOut(CamelModel):
    id: int
    project_id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    comments: list[CommentOut] = []
    attachments: list[AttachmentOut] = []
