from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import CamelModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    company: str | None = None
    nda_text: str | None = None  # raw NDA text to upload to IPFS


class ProjectOut(CamelModel):
    id: int
    name: str
    description: str | None
    company: str | None
    owner_id: int
    nda_ipfs_hash: str | None
    created_at: datetime


class ProjectMemberOut(CamelModel):
    project_id: int
    user_id: int
    role: str
    nda_signed: bool


class ProjectMemberDetailOut(CamelModel):
    user_id: int
    full_name: str | None
    email: str
    role: str
    nda_signed: bool


class InviteRequest(BaseModel):
    email: str | None = None
    role: str = "member"


class InviteClaimRequest(BaseModel):
    token: str
