from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QRToken(Base):
    __tablename__ = "qr_tokens"

    token: Mapped[str] = mapped_column(String(255), primary_key=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"))
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="member")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)

    project = relationship("Project", back_populates="qr_tokens")
    user = relationship("User")
