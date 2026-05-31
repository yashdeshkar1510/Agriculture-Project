from fastapi import APIRouter, status, HTTPException, Depends

from models.loan import LoanRequest
from services.loan import apply_for_loan, list_loan_applications, update_loan_application_status
from services.auth import require_roles, get_current_user
from models.auth import UserRole, UserPublic
from services.audit import log_action


router = APIRouter(prefix="/loan", tags=["Loan Applications"])


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply(payload: LoanRequest, current_user: UserPublic = Depends(require_roles(UserRole.FARMER))):
    # attach farmer id if available from current_user
    if current_user and current_user.user_role == UserRole.FARMER:
        # set farmer_id attribute dynamically
        setattr(payload, "farmer_id", current_user.id)

    saved = await apply_for_loan(payload)
    await log_action(actor=current_user.email if current_user else "anonymous", action="apply", resource=saved.get("id"), details={"status": saved.get("status")})
    return saved


@router.get("/applications")
async def applications(limit: int = 50, skip: int = 0, current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
    docs = await list_loan_applications(limit=limit)
    return {"count": len(docs), "items": docs}


@router.post("/applications/{application_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
async def approve(application_id: str, current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
    try:
        await update_loan_application_status(application_id, "approved")
        await log_action(actor=current_user.email, action="approve", resource=application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application id")


@router.post("/applications/{application_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject(application_id: str, current_user: UserPublic = Depends(require_roles(UserRole.BANK))):
    try:
        await update_loan_application_status(application_id, "rejected")
        await log_action(actor=current_user.email, action="reject", resource=application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application id")
