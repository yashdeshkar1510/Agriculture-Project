from datetime import datetime, timezone
import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from bson import ObjectId
from fastapi import HTTPException, status
from starlette.concurrency import run_in_threadpool

from backend.database.connection import get_weather_history_collection
from backend.models.weather import WeatherRecordResponse, WeatherSearchRequest


OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_BASE_URL = os.getenv(
    "OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5/weather"
)


def _build_weather_payload(location: str) -> dict:
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENWEATHER_API_KEY is not configured.",
        )

    query = urlencode({"q": location, "appid": OPENWEATHER_API_KEY, "units": "metric"})
    request = Request(f"{OPENWEATHER_BASE_URL}?{query}", headers={"User-Agent": "AgroPlatformWeather/1.0"})

    try:
        with urlopen(request, timeout=20) as response:
          payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weather data not found for the supplied location.",
            ) from error
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenWeather request failed.",
        ) from error
    except URLError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach the weather service.",
        ) from error

    if payload.get("cod") not in (200, "200"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=payload.get("message", "Weather data not found for the supplied location."),
        )

    return payload


def _serialize_record(document: dict) -> WeatherRecordResponse:
    return WeatherRecordResponse(
        id=str(document["_id"]),
        queryLocation=document["query_location"],
        resolvedLocation=document["resolved_location"],
        temperature=document["temperature"],
        humidity=document["humidity"],
        rainfall=document["rainfall"],
        windSpeed=document["wind_speed"],
        condition=document["condition"],
        description=document["description"],
        icon=document.get("icon"),
        fetchedAt=document["fetched_at"],
    )


async def get_weather(location_request: WeatherSearchRequest) -> WeatherRecordResponse:
    payload = await run_in_threadpool(_build_weather_payload, location_request.location)
    weather = payload.get("weather", [{}])[0]
    main = payload.get("main", {})
    wind = payload.get("wind", {})
    rain = payload.get("rain", {}) or {}
    sys_data = payload.get("sys", {}) or {}

    resolved_location = payload.get("name") or location_request.location
    if sys_data.get("country"):
        resolved_location = f"{resolved_location}, {sys_data['country']}"

    now = datetime.now(timezone.utc)
    document = {
        "query_location": location_request.location,
        "resolved_location": resolved_location,
        "temperature": round(float(main.get("temp", 0.0)), 1),
        "humidity": int(main.get("humidity", 0)),
        "rainfall": round(float(rain.get("1h") or rain.get("3h") or 0.0), 1),
        "wind_speed": round(float(wind.get("speed", 0.0)), 1),
        "condition": weather.get("main", "Unknown"),
        "description": weather.get("description", "").title() or "No description available",
        "icon": weather.get("icon"),
        "fetched_at": now,
    }

    result = await get_weather_history_collection().insert_one(document)
    saved_document = await get_weather_history_collection().find_one({"_id": result.inserted_id})
    return _serialize_record(saved_document)


async def list_weather_history(limit: int = 8) -> list[WeatherRecordResponse]:
    documents = await get_weather_history_collection().find().sort("fetched_at", -1).to_list(length=limit)
    return [_serialize_record(document) for document in documents]


async def delete_weather_history_record(record_id: str) -> None:
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid weather history id.")

    result = await get_weather_history_collection().delete_one({"_id": ObjectId(record_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weather history entry not found.")