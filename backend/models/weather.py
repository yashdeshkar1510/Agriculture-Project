from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class WeatherSearchRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    location: str = Field(min_length=2, max_length=120)

    @field_validator("location")
    @classmethod
    def trim_location(cls, value: str) -> str:
        return value.strip()


class WeatherRecordResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    query_location: str = Field(alias="queryLocation")
    resolved_location: str = Field(alias="resolvedLocation")
    temperature: float
    humidity: int
    rainfall: float
    wind_speed: float = Field(alias="windSpeed")
    condition: str
    description: str
    icon: str | None = None
    fetched_at: datetime = Field(alias="fetchedAt")