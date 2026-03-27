import hashlib
import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


def _ipfs_configured() -> bool:
    return bool(settings.PINATA_API_KEY and settings.PINATA_SECRET_KEY)


def _fake_hash(data: bytes) -> str:
    return "Qm" + hashlib.sha256(data).hexdigest()[:44]


async def upload_to_ipfs(file_bytes: bytes, file_name: str = "file") -> str:
    """Upload bytes to IPFS via Pinata and return the IPFS hash."""
    if not _ipfs_configured():
        fake = _fake_hash(file_bytes)
        logger.warning("IPFS not configured — returning fake hash: %s", fake)
        return fake

    url = f"{settings.PINATA_BASE_URL}/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                url,
                headers=headers,
                files={"file": (file_name, file_bytes, "application/octet-stream")},
                data={
                    "pinataOptions": json.dumps({"cidVersion": 0}),
                    "pinataMetadata": json.dumps({"name": file_name}),
                },
            )
            response.raise_for_status()
            return response.json()["IpfsHash"]
    except Exception as e:
        logger.warning("Pinata upload failed, using fake hash: %s", e)
        return _fake_hash(file_bytes)


async def upload_json_to_ipfs(json_data: dict) -> str:
    """Upload JSON to IPFS via Pinata and return the IPFS hash."""
    if not _ipfs_configured():
        raw = json.dumps(json_data).encode()
        fake = _fake_hash(raw)
        logger.warning("IPFS not configured — returning fake hash: %s", fake)
        return fake

    url = f"{settings.PINATA_BASE_URL}/pinning/pinJSONToIPFS"
    headers = {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            payload = {
                "pinataContent": json_data,
                "pinataMetadata": {"name": "data.json"},
            }
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["IpfsHash"]
    except Exception as e:
        logger.warning("Pinata JSON upload failed, using fake hash: %s", e)
        raw = json.dumps(json_data).encode()
        return _fake_hash(raw)
