from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.base import CamelModel


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(CamelModel):
    id: int
    email: str
    full_name: str | None
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
