from fastapi import APIRouter, HTTPException, status

from backend.models.farmer_profile import FarmerProfileCreate, FarmerProfileResponse, FarmerProfileUpdate
from backend.services.farmer_profiles import create_profile, delete_profile, get_profile, list_profiles, update_profile


router = APIRouter(prefix="/farmers", tags=["Farmer Profiles"])


@router.get("", response_model=list[FarmerProfileResponse])
async def get_farmer_profiles():
    return await list_profiles()


@router.get("/{profile_id}", response_model=FarmerProfileResponse)
async def get_farmer_profile(profile_id: str):
    return await get_profile(profile_id)


@router.post("", response_model=FarmerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer_profile(payload: FarmerProfileCreate):
    return await create_profile(payload)


@router.put("/{profile_id}", response_model=FarmerProfileResponse)
async def edit_farmer_profile(profile_id: str, payload: FarmerProfileUpdate):
    return await update_profile(profile_id, payload)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_farmer_profile(profile_id: str):
    await delete_profile(profile_id)
    return None