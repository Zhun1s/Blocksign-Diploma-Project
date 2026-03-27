import hashlib
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


def _ipfs_configured() -> bool:
    return bool(settings.PINATA_API_KEY and settings.PINATA_SECRET_KEY)


async def upload_to_ipfs(file_bytes: bytes, file_name: str = "file") -> str:
    """Upload bytes to IPFS via Pinata and return the IPFS hash."""
    if not _ipfs_configured():
        fake_hash = "Qm" + hashlib.sha256(file_bytes).hexdigest()[:44]
        logger.warning("IPFS not configured — returning fake hash: %s", fake_hash)
        return fake_hash

    url = f"{settings.PINATA_BASE_URL}/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            url,
            headers=headers,
            files={"file": (file_name, file_bytes)},
        )
        response.raise_for_status()
        data = response.json()
        return data["IpfsHash"]


async def upload_json_to_ipfs(json_data: dict) -> str:
    """Upload JSON to IPFS via Pinata and return the IPFS hash."""
    if not _ipfs_configured():
        import json
        raw = json.dumps(json_data).encode()
        fake_hash = "Qm" + hashlib.sha256(raw).hexdigest()[:44]
        logger.warning("IPFS not configured — returning fake hash: %s", fake_hash)
        return fake_hash

    url = f"{settings.PINATA_BASE_URL}/pinning/pinJSONToIPFS"
    headers = {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, json=json_data)
        response.raise_for_status()
        data = response.json()
        return data["IpfsHash"]
