from fastapi import APIRouter, status

from backend.models.loan import LoanRequest, LoanRecommendationResponse
from backend.services.loan import recommend_loan


router = APIRouter(prefix="/loan", tags=["Loan Recommendation"])


@router.post("/recommendation", response_model=LoanRecommendationResponse, status_code=status.HTTP_200_OK)
async def loan_recommendation(payload: LoanRequest):
    # synchronous computation is acceptable here
    return recommend_loan(payload)
