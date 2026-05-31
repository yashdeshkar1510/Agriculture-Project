from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from database.connection import get_farmer_profile_collection, get_loan_applications_collection
from bson import ObjectId
from services.auth import require_roles
from models.auth import UserRole, UserPublic
from services.audit import log_action
import csv
import io

router = APIRouter(prefix="/bank", tags=["Bank Dashboard"])


@router.get("/farmers")
async def list_farmers(
    search: str | None = None,
    risk: str | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
    current_user: UserPublic = Depends(require_roles(UserRole.BANK)),
):
    coll = get_farmer_profile_collection()
    query = {}
    if search:
        query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"village": {"$regex": search, "$options": "i"}}]

    # risk filter is simplistic - expects 'high' to mean credit_score < 400
    if risk == "high":
        query["credit_score"] = {"$lt": 400}

    total = await coll.count_documents(query)
    docs = await coll.find(query).skip(skip).limit(limit).to_list(length=limit)
    for d in docs:
        d["id"] = str(d["_id"]) if isinstance(d.get("_id"), ObjectId) else d.get("_id")
    return {"total": total, "items": docs}


@router.get("/analytics")
async def analytics(current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
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


@router.get("/export/applications")
async def export_applications(status: str | None = None, current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
    coll = get_loan_applications_collection()
    query = {}
    if status:
        query["status"] = status

    cursor = coll.find(query)

    def iter_csv():
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["id", "farmer_id", "annual_income", "recommended_amount", "interest_rate", "status", "created_at"])
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)

        import asyncio

        async def _iterate():
            async for doc in cursor:
                row = [str(doc.get("_id")), str(doc.get("farmer_id") or ""), doc.get("applicant", {}).get("annual_income"), doc.get("recommendation", {}).get("recommended_amount"), doc.get("recommendation", {}).get("interest_rate"), doc.get("status"), doc.get("created_at")]
                writer.writerow(row)
                yield buffer.getvalue()
                buffer.seek(0)
                buffer.truncate(0)

        loop = asyncio.new_event_loop()
        try:
            for chunk in loop.run_until_complete(_iterate()):
                yield chunk
        finally:
            loop.close()

    await log_action(actor=current_user.email, action="export_applications", resource="loan_applications")
    return StreamingResponse(iter_csv(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=loan_applications.csv"})
