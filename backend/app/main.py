from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import users, projects, nda, files, reports, tasks

app = FastAPI(
    title="Diploma — Private Project Management API",
    description=(
        "Backend-система управления приватными проектами с QR/NDA подписанием "
        "и хранением хешей в Polygon.\n\n"
        "### Основные возможности\n"
        "- Регистрация / аутентификация (JWT)\n"
        "- Создание проектов с загрузкой NDA в IPFS\n"
        "- Приглашение участников через одноразовые QR-токены\n"
        "- Подписание NDA: подпись → IPFS, SHA-256 хеш → Polygon\n"
        "- Доступ к файлам и репортам только после подписания NDA\n\n"
        "### Авторизация\n"
        "Нажмите **Authorize** и введите JWT-токен, полученный через `POST /users/login`."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(nda.router)
app.include_router(files.router)
app.include_router(reports.router)
app.include_router(tasks.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
