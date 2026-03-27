from datetime import datetime

from app.schemas.base import CamelModel


class FileOut(CamelModel):
    id: int
    project_id: int
    file_name: str
    ipfs_hash: str
    file_size: int | None
    uploaded_by: int
    created_at: datetime
