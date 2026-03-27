from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/diploma"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # IPFS (Pinata)
    PINATA_API_KEY: str = ""
    PINATA_SECRET_KEY: str = ""
    PINATA_BASE_URL: str = "https://api.pinata.cloud"
    IPFS_GATEWAY: str = "https://gateway.pinata.cloud/ipfs"

    # Polygon
    POLYGON_RPC_URL: str = "https://rpc-amoy.polygon.technology"
    CONTRACT_ADDRESS: str = ""
    WALLET_PRIVATE_KEY: str = ""
    WALLET_ADDRESS: str = ""

    # App
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
