from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from database.connection import get_user_collection, get_audit_collection
from models.auth import UserRole, RegisterRequest
from services.auth import require_roles, hash_password, serialize_user
from services.audit import log_action
from services.analytics import (
    farmer_distribution,
    loan_approval_stats,
    risk_category_analysis,
    district_wise_analytics,
    crop_performance_trends,
)
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
async def list_users(role: UserRole | None = Query(None), limit: int = 100, skip: int = 0, current_user=Depends(require_roles(UserRole.ADMIN))):
    coll = get_user_collection()
    query = {}
    if role:
        query["user_role"] = role.value
    total = await coll.count_documents(query)
    docs = await coll.find(query).skip(skip).limit(limit).to_list(length=limit)
    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("password_hash", None)
    return {"total": total, "items": docs}


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(payload: RegisterRequest, current_user=Depends(require_roles(UserRole.ADMIN))):
    coll = get_user_collection()
    doc = {
        "full_name": payload.full_name,
        "email": payload.email.lower(),
        "mobile_number": payload.mobile_number,
        "password_hash": hash_password(payload.password),
        "user_role": payload.user_role.value,
    }
    existing = await coll.find_one({"email": doc["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    result = await coll.insert_one(doc)
    saved = await coll.find_one({"_id": result.inserted_id})
    saved["id"] = str(saved["_id"])
    await log_action(actor=current_user.email, action="create_user", resource=saved["id"])
    saved.pop("password_hash", None)
    return saved


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role: UserRole, current_user=Depends(require_roles(UserRole.ADMIN))):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user id")
    coll = get_user_collection()
    result = await coll.update_one({"_id": ObjectId(user_id)}, {"$set": {"user_role": role.value}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await log_action(actor=current_user.email, action="update_role", resource=user_id, details={"role": role.value})
    return {"status": "ok"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user=Depends(require_roles(UserRole.ADMIN))):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user id")
    coll = get_user_collection()
    result = await coll.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await log_action(actor=current_user.email, action="delete_user", resource=user_id)
    return {"status": "deleted"}


@router.get("/audit")
async def list_audit(limit: int = 100, skip: int = 0, current_user=Depends(require_roles(UserRole.ADMIN))):
    coll = get_audit_collection()
    total = await coll.count_documents({})
    docs = await coll.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    for d in docs:
        d["id"] = str(d["_id"])
    return {"total": total, "items": docs}


@router.get("/overview")
async def overview(current_user=Depends(require_roles(UserRole.ADMIN))):
    return {
        "farmers_by_region": await farmer_distribution(),
        "loan_stats": await loan_approval_stats(),
        "risk_analysis": await risk_category_analysis(),
    }
