# Diploma Backend — Private Project Management API

Backend-система управления приватными проектами с QR/NDA подписанием и хранением хешей в Polygon.

## Технологии

- **Python 3.12**, **FastAPI**
- **PostgreSQL** + SQLAlchemy (async) + Alembic
- **IPFS** (Pinata API)
- **Polygon** (Web3.py)
- **JWT** аутентификация (bcrypt + python-jose)

## Быстрый старт

### 1. Клонировать и создать виртуальное окружение

```bash
cd diploma_backend
python3.12 -m venv venv
source venv/bin/activate      # Linux/macOS
# venv\Scripts\activate       # Windows
```

### 2. Установить зависимости

```bash
pip install -r requirements.txt
```

### 3. Настроить переменные окружения

```bash
cp .env.example .env
```

Открыть `.env` и заполнить:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql+asyncpg://user:pass@host:5432/db`) |
| `SECRET_KEY` | Секрет для JWT (любая длинная строка) |
| `PINATA_API_KEY` | API ключ Pinata (для IPFS) |
| `PINATA_SECRET_KEY` | Secret ключ Pinata |
| `POLYGON_RPC_URL` | RPC URL Polygon (Mumbai testnet: `https://rpc-mumbai.maticvigil.com`) |
| `CONTRACT_ADDRESS` | Адрес deployed NDAAccess smart contract |
| `WALLET_PRIVATE_KEY` | Приватный ключ кошелька для отправки транзакций |

> Blockchain и IPFS необязательны для разработки — backend работает без них (graceful degradation).

### 4. Создать базу данных

```bash
# Создать БД в PostgreSQL
createdb diploma

# Сгенерировать и применить миграции
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 5. Запустить сервер

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Сервер будет доступен на `http://localhost:8000`.

## Swagger / API документация

После запуска сервера:

| URL | Описание |
|---|---|
| [http://localhost:8000/docs](http://localhost:8000/docs) | **Swagger UI** — интерактивная документация с возможностью отправлять запросы |
| [http://localhost:8000/redoc](http://localhost:8000/redoc) | **ReDoc** — альтернативная документация |
| [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) | OpenAPI 3.1 спецификация (JSON) |

### Авторизация в Swagger

1. Зарегистрировать пользователя: `POST /users/register`
2. Залогиниться: `POST /users/login` — скопировать `access_token`
3. Нажать кнопку **Authorize** в правом верхнем углу Swagger UI
4. Вставить токен в поле и нажать **Authorize**
5. Все последующие запросы будут отправляться с JWT

## API Endpoints

### Users
| Метод | URL | Описание |
|---|---|---|
| POST | `/users/register` | Регистрация |
| POST | `/users/login` | Аутентификация (JWT) |

### Projects
| Метод | URL | Описание |
|---|---|---|
| POST | `/projects` | Создать проект |
| GET | `/projects` | Список проектов пользователя |
| GET | `/projects/{id}` | Детали проекта |
| POST | `/projects/{id}/invite` | Пригласить пользователя (QR-токен) |

### NDA
| Метод | URL | Описание |
|---|---|---|
| GET | `/projects/{id}/nda-access?token=XXX` | Получить NDA по QR-токену |
| POST | `/projects/{id}/nda-sign` | Подписать NDA (IPFS + Polygon) |

### Files (требуется подписанный NDA)
| Метод | URL | Описание |
|---|---|---|
| POST | `/projects/{id}/files` | Загрузить файл в IPFS |
| GET | `/projects/{id}/files` | Список файлов проекта |

### Reports (требуется подписанный NDA)
| Метод | URL | Описание |
|---|---|---|
| POST | `/projects/{id}/reports` | Создать репорт |
| GET | `/projects/{id}/reports` | Список репортов |

## Тесты

```bash
pip install pytest pytest-asyncio aiosqlite greenlet
python -m pytest tests/ -v
```

Тесты используют SQLite in-memory (не требуется PostgreSQL). IPFS и blockchain замоканы.

## Docker

```bash
docker build -t diploma-backend .
docker run -p 8000:8000 --env-file .env diploma-backend
```

## Структура проекта

```
app/
├── main.py              # FastAPI app, CORS, роутеры
├── config.py            # Настройки из .env
├── database.py          # Async SQLAlchemy engine
├── dependencies.py      # JWT auth, NDA проверка
├── models/              # SQLAlchemy модели
│   ├── user.py
│   ├── project.py       # Project + ProjectMember
│   ├── file.py
│   ├── report.py
│   └── qr_token.py
├── schemas/             # Pydantic схемы (request/response)
│   ├── user.py
│   ├── project.py
│   ├── file.py
│   ├── report.py
│   └── nda.py
├── routers/             # API endpoints
│   ├── users.py
│   ├── projects.py
│   ├── nda.py
│   ├── files.py
│   └── reports.py
└── services/            # Бизнес-логика
    ├── auth.py          # JWT + bcrypt
    ├── ipfs.py          # Pinata API
    └── blockchain.py    # Web3.py → Polygon
```
