from datetime import datetime, timedelta, timezone
import os
from typing import Callable

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.database.connection import get_user_collection
from backend.models.auth import UserPublic, UserRole


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    token_data = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    token_data.update({"exp": expire})
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)


def _serialize_user(document: dict) -> UserPublic:
    return UserPublic(
        id=str(document["_id"]),
        full_name=document["full_name"],
        email=document["email"],
        mobile_number=document["mobile_number"],
        user_role=document["user_role"],
        created_at=document["created_at"],
    )


async def get_user_by_email(email: str):
    collection = get_user_collection()
    return await collection.find_one({"email": email.lower()})


async def authenticate_user(email: str, password: str, user_role: UserRole):
    user = await get_user_by_email(email)
    if not user:
        return None

    if user.get("user_role") != user_role.value:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc

    collection = get_user_collection()
    user = await collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise credentials_error

    return _serialize_user(user)


def require_roles(*allowed_roles: UserRole) -> Callable:
    async def role_dependency(current_user: UserPublic = Depends(get_current_user)):
        if current_user.user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )
        return current_user

    return role_dependency


def serialize_user(document: dict) -> UserPublic:
    return _serialize_user(document)