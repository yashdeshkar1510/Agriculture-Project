from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from backend.database.connection import get_farmer_profile_collection
from backend.models.farmer_profile import FarmerProfileCreate, FarmerProfileResponse, FarmerProfileUpdate


def _serialize_profile(document: dict) -> FarmerProfileResponse:
    return FarmerProfileResponse(
        id=str(document["_id"]),
        farmerName=document["farmer_name"],
        age=document["age"],
        gender=document["gender"],
        aadhaarNumber=document["aadhaar_number"],
        mobileNumber=document["mobile_number"],
        state=document["state"],
        district=document["district"],
        village=document["village"],
        totalLandHolding=document["total_land_holding"],
        irrigationAvailability=document["irrigation_availability"],
        farmingExperience=document["farming_experience"],
        createdAt=document["created_at"].isoformat(),
        updatedAt=document["updated_at"].isoformat(),
    )


async def list_profiles() -> list[FarmerProfileResponse]:
    collection = get_farmer_profile_collection()
    documents = await collection.find().sort("created_at", -1).to_list(length=1000)
    return [_serialize_profile(document) for document in documents]


async def get_profile(profile_id: str) -> FarmerProfileResponse:
    if not ObjectId.is_valid(profile_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile id.")

    document = await get_farmer_profile_collection().find_one({"_id": ObjectId(profile_id)})
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found.")

    return _serialize_profile(document)


async def create_profile(payload: FarmerProfileCreate) -> FarmerProfileResponse:
    collection = get_farmer_profile_collection()
    existing_profile = await collection.find_one({"aadhaar_number": payload.aadhaar_number})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A farmer profile with this Aadhaar number already exists.",
        )

    now = datetime.now(timezone.utc)
    document = {
        "farmer_name": payload.farmer_name,
        "age": payload.age,
        "gender": payload.gender.value,
        "aadhaar_number": payload.aadhaar_number,
        "mobile_number": payload.mobile_number,
        "state": payload.state,
        "district": payload.district,
        "village": payload.village,
        "total_land_holding": payload.total_land_holding,
        "irrigation_availability": payload.irrigation_availability.value,
        "farming_experience": payload.farming_experience,
        "created_at": now,
        "updated_at": now,
    }

    result = await collection.insert_one(document)
    saved_document = await collection.find_one({"_id": result.inserted_id})
    return _serialize_profile(saved_document)


async def update_profile(profile_id: str, payload: FarmerProfileUpdate) -> FarmerProfileResponse:
    if not ObjectId.is_valid(profile_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile id.")

    collection = get_farmer_profile_collection()
    existing_document = await collection.find_one({"_id": ObjectId(profile_id)})
    if not existing_document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found.")

    update_payload = payload.model_dump(exclude_unset=True)
    if "aadhaar_number" in update_payload:
        duplicate_profile = await collection.find_one(
            {"aadhaar_number": update_payload["aadhaar_number"], "_id": {"$ne": ObjectId(profile_id)}}
        )
        if duplicate_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A farmer profile with this Aadhaar number already exists.",
            )

    mapping = {
        "farmer_name": "farmer_name",
        "age": "age",
        "gender": "gender",
        "aadhaar_number": "aadhaar_number",
        "mobile_number": "mobile_number",
        "state": "state",
        "district": "district",
        "village": "village",
        "total_land_holding": "total_land_holding",
        "irrigation_availability": "irrigation_availability",
        "farming_experience": "farming_experience",
    }

    db_update = {}
    for key, value in update_payload.items():
        db_key = mapping[key]
        db_update[db_key] = value.value if hasattr(value, "value") else value

    db_update["updated_at"] = datetime.now(timezone.utc)
    await collection.update_one({"_id": ObjectId(profile_id)}, {"$set": db_update})
    saved_document = await collection.find_one({"_id": ObjectId(profile_id)})
    return _serialize_profile(saved_document)


async def delete_profile(profile_id: str) -> None:
    if not ObjectId.is_valid(profile_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid profile id.")

    result = await get_farmer_profile_collection().delete_one({"_id": ObjectId(profile_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found.")