from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database.connection import get_user_collection
from models.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic, UserRole
from services.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    serialize_user,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest):
    collection = get_user_collection()
    existing_user = await collection.find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    user_document = {
        "full_name": payload.full_name,
        "email": payload.email.lower(),
        "mobile_number": payload.mobile_number,
        "password_hash": hash_password(payload.password),
        "user_role": payload.user_role.value,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        result = await collection.insert_one(user_document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        ) from exc

    saved_user = await collection.find_one({"_id": result.inserted_id})
    access_token = create_access_token(
        {
            "sub": str(result.inserted_id),
            "role": payload.user_role.value,
            "email": payload.email.lower(),
        }
    )

    return {
        "accessToken": access_token,
        "user": serialize_user(saved_user),
    }


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: LoginRequest):
    user = await authenticate_user(payload.email.lower(), payload.password, payload.user_role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or role mismatch.",
        )

    access_token = create_access_token(
        {"sub": str(user["_id"]), "role": user["user_role"], "email": user["email"]}
    )

    return {
        "accessToken": access_token,
        "user": serialize_user(user),
    }


@router.get("/me", response_model=UserPublic)
async def read_current_user(current_user: UserPublic = Depends(get_current_user)):
    return current_user


@router.get("/farmer/dashboard")
async def farmer_dashboard(current_user: UserPublic = Depends(require_roles(UserRole.FARMER))):
    return {
        "message": "Farmer access granted.",
        "user": current_user,
    }


@router.get("/bank/dashboard")
async def bank_dashboard(current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
    return {
        "message": "Bank officer access granted.",
        "user": current_user,
    }