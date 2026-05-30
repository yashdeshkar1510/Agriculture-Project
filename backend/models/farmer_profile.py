from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class IrrigationAvailability(str, Enum):
    AVAILABLE = "Available"
    PARTIAL = "Partial"
    NOT_AVAILABLE = "Not Available"


class FarmerProfileCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    farmer_name: str = Field(min_length=3, max_length=120, alias="farmerName")
    age: int = Field(ge=18, le=100)
    gender: Gender
    aadhaar_number: str = Field(min_length=12, max_length=12, alias="aadhaarNumber")
    mobile_number: str = Field(min_length=7, max_length=15, alias="mobileNumber")
    state: str = Field(min_length=2, max_length=80)
    district: str = Field(min_length=2, max_length=80)
    village: str = Field(min_length=2, max_length=80)
    total_land_holding: float = Field(gt=0, alias="totalLandHolding")
    irrigation_availability: IrrigationAvailability = Field(alias="irrigationAvailability")
    farming_experience: int = Field(ge=0, le=80, alias="farmingExperience")

    @field_validator("farmer_name", "state", "district", "village", "aadhaar_number", "mobile_number")
    @classmethod
    def trim_strings(cls, value: str) -> str:
        return value.strip()

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("Aadhaar number must contain only digits.")
        return value

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("Mobile number must contain only digits.")
        return value


class FarmerProfileUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    farmer_name: str | None = Field(default=None, min_length=3, max_length=120, alias="farmerName")
    age: int | None = Field(default=None, ge=18, le=100)
    gender: Gender | None = None
    aadhaar_number: str | None = Field(default=None, min_length=12, max_length=12, alias="aadhaarNumber")
    mobile_number: str | None = Field(default=None, min_length=7, max_length=15, alias="mobileNumber")
    state: str | None = Field(default=None, min_length=2, max_length=80)
    district: str | None = Field(default=None, min_length=2, max_length=80)
    village: str | None = Field(default=None, min_length=2, max_length=80)
    total_land_holding: float | None = Field(default=None, gt=0, alias="totalLandHolding")
    irrigation_availability: IrrigationAvailability | None = Field(default=None, alias="irrigationAvailability")
    farming_experience: int | None = Field(default=None, ge=0, le=80, alias="farmingExperience")

    @field_validator("farmer_name", "state", "district", "village", "aadhaar_number", "mobile_number")
    @classmethod
    def trim_strings(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("Aadhaar number must contain only digits.")
        return value

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("Mobile number must contain only digits.")
        return value


class FarmerProfileResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    farmer_name: str = Field(alias="farmerName")
    age: int
    gender: Gender
    aadhaar_number: str = Field(alias="aadhaarNumber")
    mobile_number: str = Field(alias="mobileNumber")
    state: str
    district: str
    village: str
    total_land_holding: float = Field(alias="totalLandHolding")
    irrigation_availability: IrrigationAvailability = Field(alias="irrigationAvailability")
    farming_experience: int = Field(alias="farmingExperience")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")