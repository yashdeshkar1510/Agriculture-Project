from fastapi import APIRouter
from services.analytics import (
    farmer_distribution,
    loan_approval_stats,
    risk_category_analysis,
    district_wise_analytics,
    crop_performance_trends,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def overview():
    return {
        "farmer_distribution": await farmer_distribution(),
        "loan_approval_stats": await loan_approval_stats(),
        "risk_category_analysis": await risk_category_analysis(),
        "district_wise": await district_wise_analytics(),
        "crop_trends": await crop_performance_trends(),
    }


@router.get("/timeseries")
async def timeseries(metric: str = "loans", interval: str = "monthly"):
    # support loans or farmers or crops
    if metric == "loans":
        # simple aggregation: count applications by month
        from database.connection import get_loan_applications_collection
        coll = get_loan_applications_collection()
        pipeline = [
            {"$group": {"_id": {"year": {"$year": "$created_at"}, "month": {"$month": "$created_at"}}, "count": {"$sum": 1}}},
            {"$sort": {"_id.year": 1, "_id.month": 1}},
        ]
        cursor = coll.aggregate(pipeline)
        out = []
        async for doc in cursor:
            out.append({"year": doc["_id"]["year"], "month": doc["_id"]["month"], "count": doc["count"]})
        return out

    if metric == "crops":
        return await crop_performance_trends(limit=24)

    return []
