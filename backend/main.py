from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import close_mongo_connection, get_user_collection
from backend.routes.auth import router as auth_router


def _cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await get_user_collection().create_index("email", unique=True)
    except Exception as error:
        print(f"MongoDB index setup skipped: {error}")

    yield

    await close_mongo_connection()


app = FastAPI(
    title="Agro Platform Authentication API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
async def root():
    return {"message": "Agro Platform authentication API is running."}


@app.get("/health")
async def health():
    return {"status": "ok"}