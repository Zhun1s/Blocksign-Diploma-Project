from pydantic import BaseModel

from app.schemas.base import CamelModel


class NDASignRequest(BaseModel):
    token: str
    signature_image_base64: str


class NDASignResponse(CamelModel):
    message: str
    ipfs_hash: str
    nda_hash: str
    tx_hash: str | None = None
