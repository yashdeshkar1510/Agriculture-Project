from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import (
    close_mongo_connection,
    get_farm_record_collection,
    get_farmer_profile_collection,
    get_weather_history_collection,
    get_user_collection,
)
from routes.auth import router as auth_router
from routes.farmer_profiles import router as farmer_profiles_router
from routes.farm_records import router as farm_records_router
from routes.weather import router as weather_router
from routes.loan import router as loan_router
from routes.loan_applications import router as loan_applications_router
from routes.bank import router as bank_router
from routes.analytics import router as analytics_router
from routes.admin import router as admin_router


def _cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await get_user_collection().create_index("email", unique=True)
        await get_farmer_profile_collection().create_index("aadhaar_number", unique=True)
        await get_farm_record_collection().create_index("crop_name")
        await get_weather_history_collection().create_index("query_location")
        await get_weather_history_collection().create_index("fetched_at")
    except Exception as error:
        print(f"MongoDB index setup skipped: {error}")

    yield

    await close_mongo_connection()


app = FastAPI(
    title="Agro Platform API",
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
app.include_router(farmer_profiles_router)
app.include_router(farm_records_router)
app.include_router(weather_router)
app.include_router(loan_router)
app.include_router(loan_applications_router)
app.include_router(bank_router)
app.include_router(analytics_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    return {"message": "Agro Platform API is running."}


@app.get("/health")
async def health():
    return {"status": "ok"}