from datetime import datetime
from typing import Any

from database.connection import get_farmer_profile_collection, get_farm_record_collection, get_loan_applications_collection


async def farmer_distribution() -> dict[str, int]:
    coll = get_farmer_profile_collection()
    pipeline = [{"$group": {"_id": "$village", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    cursor = coll.aggregate(pipeline)
    result = {}
    async for doc in cursor:
        result[doc["_id"] or "Unknown"] = doc["count"]
    return result


async def loan_approval_stats() -> dict[str, int]:
    coll = get_loan_applications_collection()
    total = await coll.count_documents({})
    approved = await coll.count_documents({"status": "approved"})
    rejected = await coll.count_documents({"status": "rejected"})
    pending = await coll.count_documents({"status": "pending"})
    return {"total": total, "approved": approved, "rejected": rejected, "pending": pending}


async def risk_category_analysis() -> dict[str, int]:
    coll = get_farmer_profile_collection()
    high = await coll.count_documents({"credit_score": {"$lt": 400}})
    medium = await coll.count_documents({"credit_score": {"$gte": 400, "$lt": 600}})
    low = await coll.count_documents({"credit_score": {"$gte": 600}})
    return {"high": high, "medium": medium, "low": low}


async def district_wise_analytics() -> dict[str, Any]:
    coll = get_farmer_profile_collection()
    pipeline = [{"$group": {"_id": "$district", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    cursor = coll.aggregate(pipeline)
    out = {}
    async for doc in cursor:
        out[doc["_id"] or "Unknown"] = doc["count"]
    return out


async def crop_performance_trends(limit: int = 12) -> dict[str, int]:
    # Simple trend by counting farm_records per crop over recent records
    coll = get_farm_record_collection()
    pipeline = [
        {"$group": {"_id": "$crop_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
    ]
    cursor = coll.aggregate(pipeline)
    out = {}
    async for doc in cursor:
        out[doc["_id"] or "Unknown"] = doc["count"]
    return out
