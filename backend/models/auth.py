from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UserRole(str, Enum):
    FARMER = "farmer"
    BANK = "bank"
    ADMIN = "admin"


class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(min_length=3, max_length=120, alias="fullName")
    email: EmailStr
    mobile_number: str = Field(min_length=7, max_length=20, alias="mobileNumber")
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128, alias="confirmPassword")
    user_role: UserRole = Field(alias="userRole")

    @field_validator("full_name", "mobile_number")
    @classmethod
    def trim_strings(cls, value: str) -> str:
        return value.strip()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(character.isalpha() for character in value) or not any(
            character.isdigit() for character in value
        ):
            raise ValueError("Password must include at least one letter and one digit.")
        return value

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    user_role: UserRole = Field(alias="userRole")


class UserPublic(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    full_name: str = Field(alias="fullName")
    email: EmailStr
    mobile_number: str = Field(alias="mobileNumber")
    user_role: UserRole = Field(alias="userRole")
    created_at: datetime = Field(alias="createdAt")


class TokenResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")
    user: UserPublic