from fastapi import APIRouter, status, HTTPException

from backend.models.loan import LoanRequest
from backend.services.loan import apply_for_loan, list_loan_applications, update_loan_application_status


router = APIRouter(prefix="/loan", tags=["Loan Applications"])


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply(payload: LoanRequest):
    return await apply_for_loan(payload)


@router.get("/applications")
async def applications(limit: int = 50):
    return await list_loan_applications(limit)


@router.post("/applications/{application_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
async def approve(application_id: str):
    try:
        await update_loan_application_status(application_id, "approved")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application id")


@router.post("/applications/{application_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject(application_id: str):
    try:
        await update_loan_application_status(application_id, "rejected")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application id")
