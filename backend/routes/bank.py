from fastapi import APIRouter
from database.connection import get_farmer_profile_collection, get_loan_applications_collection
from bson import ObjectId

router = APIRouter(prefix="/bank", tags=["Bank Dashboard"])


@router.get("/farmers")
async def list_farmers(search: str | None = None, risk: str | None = None, limit: int = 50):
    coll = get_farmer_profile_collection()
    query = {}
    if search:
        query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"village": {"$regex": search, "$options": "i"}}]

    # risk filter is simplistic - expects 'high' to mean credit_score < 400
    if risk == "high":
        query["credit_score"] = {"$lt": 400}

    docs = await coll.find(query).limit(limit).to_list(length=limit)
    for d in docs:
        d["id"] = str(d["_id"]) if isinstance(d.get("_id"), ObjectId) else d.get("_id")
    return docs


@router.get("/analytics")
async def analytics():
    farmers_coll = get_farmer_profile_collection()
    loans_coll = get_loan_applications_collection()

    total_farmers = await farmers_coll.count_documents({})
    approved_loans = await loans_coll.count_documents({"status": "approved"})
    pending_loans = await loans_coll.count_documents({"status": "pending"})
    high_risk = await farmers_coll.count_documents({"credit_score": {"$lt": 400}})

    return {
        "total_farmers": total_farmers,
        "approved_loans": approved_loans,
        "pending_loans": pending_loans,
        "high_risk_farmers": high_risk,
    }
