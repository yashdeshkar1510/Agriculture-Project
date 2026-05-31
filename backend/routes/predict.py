from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random

router = APIRouter(prefix="/predict", tags=["AI Predictions"])

class CreditRequest(BaseModel):
    applicant_id: str | None = None
    features: dict

class CreditResponse(BaseModel):
    score: float
    risk_category: str


@router.post('/credit-score', response_model=CreditResponse)
async def predict_credit_score(payload: CreditRequest):
    # Placeholder: replace with real model inference later
    if not payload.features:
        raise HTTPException(status_code=400, detail="No features provided")

    score = max(0.0, min(1.0, random.random()))
    if score < 0.33:
        risk = 'high'
    elif score < 0.66:
        risk = 'medium'
    else:
        risk = 'low'

    return {"score": round(score, 3), "risk_category": risk}
