from typing import Tuple
from math import floor

from backend.models.loan import LoanRequest, LoanRecommendationResponse


def _score_risk(credit_score: int | None, years_farming: float, existing_debt: float, income: float) -> Tuple[float, str]:
    # Simple heuristic risk scoring: lower is better
    score = 0.5

    if credit_score is not None:
        # normalize credit score 0-850 to 0-1
        cs = max(0, min(850, credit_score)) / 850
        score *= (1 - 0.4 * cs)
    else:
        score *= 1.05

    # more experience reduces risk
    if years_farming >= 5:
        score *= 0.9
    elif years_farming >= 2:
        score *= 0.97

    # existing debt increases risk
    debt_ratio = existing_debt / max(1.0, income)
    if debt_ratio > 0.5:
        score *= 1.4
    elif debt_ratio > 0.2:
        score *= 1.15

    # clamp score
    score = max(0.05, min(1.5, score))

    explanation = (
        f"Risk score heuristic: base adjusted by credit, experience, and debt ratio ({debt_ratio:.2f})."
    )
    return score, explanation


def recommend_loan(payload: LoanRequest) -> LoanRecommendationResponse:
    income = payload.annual_income
    farm = payload.farm_size_hectares

    # Base recommended amount: proportional to income and farm size
    base = min(income * 0.5, 200000) + farm * 10000

    risk, explanation = _score_risk(payload.credit_score, payload.years_farming or 0.0, payload.existing_debt or 0.0, income)

    # interest and term derived from risk
    if risk < 0.6:
        interest = 0.08
        months = 36
    elif risk < 1.0:
        interest = 0.12
        months = 48
    else:
        interest = 0.18
        months = 60

    # recommended amount scaled down by risk
    recommended = base * (1.0 / risk) if risk > 0 else base * 0.5

    # cap recommended amount to a sensible upper bound
    recommended = min(recommended, max(500000, income * 5 + farm * 50000))

    # eligibility heuristic
    eligible = True
    if payload.credit_score is not None and payload.credit_score < 300:
        eligible = False
    if income < 5000 and recommended > income * 10:
        eligible = False

    confidence = max(0.1, min(0.99, 1.0 - (risk - 0.5)))

    # round and return
    rec = LoanRecommendationResponse(
        recommended_amount=round(recommended, 2),
        interest_rate=round(interest, 3),
        repayment_months=int(months),
        eligible=eligible,
        risk_explanation=explanation,
        confidence=round(confidence, 2),
    )

    return rec
