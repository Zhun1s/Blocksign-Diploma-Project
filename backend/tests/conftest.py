import os
from datetime import datetime, timedelta, UTC
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.models.qr_token import QRToken
from app.services.auth import hash_password, create_access_token

engine = create_async_engine(
    "sqlite+aiosqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with TestSession() as session:
        yield session


@pytest.fixture(autouse=True)
def override_deps():
    async def _get_test_db():
        async with TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


_ipfs_mock = AsyncMock(return_value="QmTestHash123")
_blockchain_mock = AsyncMock(return_value="0xfaketxhash")


@pytest.fixture(autouse=True)
def mock_ipfs():
    _ipfs_mock.reset_mock()
    _ipfs_mock.return_value = "QmTestHash123"
    with patch("app.routers.projects.upload_to_ipfs", _ipfs_mock), \
         patch("app.routers.nda.upload_to_ipfs", _ipfs_mock), \
         patch("app.routers.files.upload_to_ipfs", _ipfs_mock):
        yield _ipfs_mock


@pytest.fixture(autouse=True)
def mock_blockchain():
    _blockchain_mock.reset_mock()
    _blockchain_mock.return_value = "0xfaketxhash"
    with patch("app.routers.nda.store_nda_hash_on_chain", _blockchain_mock):
        yield _blockchain_mock


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(email="test@example.com", hashed_password=hash_password("password123"))
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    token = create_access_token({"sub": test_user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def second_user(db_session: AsyncSession) -> User:
    user = User(email="second@example.com", hashed_password=hash_password("password123"))
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_project(db_session: AsyncSession, test_user: User) -> Project:
    project = Project(name="Test Project", description="desc", owner_id=test_user.id)
    db_session.add(project)
    await db_session.flush()
    member = ProjectMember(
        project_id=project.id, user_id=test_user.id, role="owner", nda_signed=True
    )
    db_session.add(member)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest.fixture
async def invited_member(
    db_session: AsyncSession, test_project: Project, second_user: User
) -> tuple[ProjectMember, QRToken]:
    member = ProjectMember(
        project_id=test_project.id, user_id=second_user.id, role="member", nda_signed=False
    )
    db_session.add(member)

    qr = QRToken(
        token="test-qr-token-123",
        project_id=test_project.id,
        user_id=second_user.id,
        expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(hours=24),
    )
    db_session.add(qr)
    await db_session.commit()
    await db_session.refresh(member)
    return member, qr
