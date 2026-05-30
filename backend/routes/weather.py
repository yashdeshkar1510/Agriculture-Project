from fastapi import APIRouter, Query, status

from backend.models.weather import WeatherRecordResponse, WeatherSearchRequest
from backend.services.weather import delete_weather_history_record, get_weather, list_weather_history


router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])


@router.post("/search", response_model=WeatherRecordResponse, status_code=status.HTTP_201_CREATED)
async def search_weather(payload: WeatherSearchRequest):
    return await get_weather(payload)


@router.get("/history", response_model=list[WeatherRecordResponse])
async def weather_history(limit: int = Query(default=8, ge=1, le=20)):
    return await list_weather_history(limit)


@router.delete("/history/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_history_item(record_id: str):
    await delete_weather_history_record(record_id)
    return None