from pydantic import BaseModel, Field
from typing import Optional


class LoanRequest(BaseModel):
    annual_income: float = Field(..., ge=0, description="Farmer's annual income in local currency")
    farm_size_hectares: float = Field(..., ge=0, description="Farm size in hectares")
    credit_score: Optional[int] = Field(None, ge=0, le=850, description="Optional credit score (0-850)")
    years_farming: Optional[float] = Field(0.0, ge=0, description="Years of farming experience")
    existing_debt: Optional[float] = Field(0.0, ge=0, description="Existing outstanding debt")


class LoanRecommendationResponse(BaseModel):
    recommended_amount: float
    interest_rate: float
    repayment_months: int
    eligible: bool
    risk_explanation: str
    confidence: float = Field(..., ge=0.0, le=1.0)
