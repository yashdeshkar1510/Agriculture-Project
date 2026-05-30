from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FarmRecordCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    crop_name: str = Field(min_length=2, max_length=120, alias="cropName")
    crop_season: str = Field(min_length=2, max_length=80, alias="cropSeason")
    area_cultivated: float = Field(gt=0, alias="areaCultivated")
    soil_type: str = Field(min_length=2, max_length=80, alias="soilType")
    previous_yield: float = Field(ge=0, alias="previousYield")
    current_yield: float = Field(ge=0, alias="currentYield")
    fertilizer_usage: str = Field(min_length=2, max_length=120, alias="fertilizerUsage")
    irrigation_source: str = Field(min_length=2, max_length=120, alias="irrigationSource")
    pest_incidents: int = Field(ge=0, alias="pestIncidents")
    annual_farm_income: float = Field(ge=0, alias="annualFarmIncome")

    @field_validator("crop_name", "crop_season", "soil_type", "fertilizer_usage", "irrigation_source")
    @classmethod
    def trim_strings(cls, value: str) -> str:
        return value.strip()


class FarmRecordUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    crop_name: str | None = Field(default=None, min_length=2, max_length=120, alias="cropName")
    crop_season: str | None = Field(default=None, min_length=2, max_length=80, alias="cropSeason")
    area_cultivated: float | None = Field(default=None, gt=0, alias="areaCultivated")
    soil_type: str | None = Field(default=None, min_length=2, max_length=80, alias="soilType")
    previous_yield: float | None = Field(default=None, ge=0, alias="previousYield")
    current_yield: float | None = Field(default=None, ge=0, alias="currentYield")
    fertilizer_usage: str | None = Field(default=None, min_length=2, max_length=120, alias="fertilizerUsage")
    irrigation_source: str | None = Field(default=None, min_length=2, max_length=120, alias="irrigationSource")
    pest_incidents: int | None = Field(default=None, ge=0, alias="pestIncidents")
    annual_farm_income: float | None = Field(default=None, ge=0, alias="annualFarmIncome")

    @field_validator("crop_name", "crop_season", "soil_type", "fertilizer_usage", "irrigation_source")
    @classmethod
    def trim_strings(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class FarmRecordResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    crop_name: str = Field(alias="cropName")
    crop_season: str = Field(alias="cropSeason")
    area_cultivated: float = Field(alias="areaCultivated")
    soil_type: str = Field(alias="soilType")
    previous_yield: float = Field(alias="previousYield")
    current_yield: float = Field(alias="currentYield")
    fertilizer_usage: str = Field(alias="fertilizerUsage")
    irrigation_source: str = Field(alias="irrigationSource")
    pest_incidents: int = Field(alias="pestIncidents")
    annual_farm_income: float = Field(alias="annualFarmIncome")
    yield_change: float = Field(alias="yieldChange")
    productivity_score: float = Field(alias="productivityScore")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")