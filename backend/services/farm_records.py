from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from database.connection import get_farm_record_collection
from models.farm_record import FarmRecordCreate, FarmRecordResponse, FarmRecordUpdate


def _serialize_record(document: dict) -> FarmRecordResponse:
    previous_yield = float(document["previous_yield"])
    current_yield = float(document["current_yield"])
    yield_change = round(current_yield - previous_yield, 2)
    productivity_score = round(
        max(0.0, min(100.0, 55 + (current_yield * 2) - (document["pest_incidents"] * 3))),
        2,
    )

    return FarmRecordResponse(
        id=str(document["_id"]),
        cropName=document["crop_name"],
        cropSeason=document["crop_season"],
        areaCultivated=document["area_cultivated"],
        soilType=document["soil_type"],
        previousYield=previous_yield,
        currentYield=current_yield,
        fertilizerUsage=document["fertilizer_usage"],
        irrigationSource=document["irrigation_source"],
        pestIncidents=document["pest_incidents"],
        annualFarmIncome=document["annual_farm_income"],
        yieldChange=yield_change,
        productivityScore=productivity_score,
        createdAt=document["created_at"].isoformat(),
        updatedAt=document["updated_at"].isoformat(),
    )


async def list_records() -> list[FarmRecordResponse]:
    documents = await get_farm_record_collection().find().sort("created_at", -1).to_list(length=1000)
    return [_serialize_record(document) for document in documents]


async def get_record(record_id: str) -> FarmRecordResponse:
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record id.")

    document = await get_farm_record_collection().find_one({"_id": ObjectId(record_id)})
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")

    return _serialize_record(document)


async def create_record(payload: FarmRecordCreate) -> FarmRecordResponse:
    now = datetime.now(timezone.utc)
    document = {
        "crop_name": payload.crop_name,
        "crop_season": payload.crop_season,
        "area_cultivated": payload.area_cultivated,
        "soil_type": payload.soil_type,
        "previous_yield": payload.previous_yield,
        "current_yield": payload.current_yield,
        "fertilizer_usage": payload.fertilizer_usage,
        "irrigation_source": payload.irrigation_source,
        "pest_incidents": payload.pest_incidents,
        "annual_farm_income": payload.annual_farm_income,
        "created_at": now,
        "updated_at": now,
    }

    result = await get_farm_record_collection().insert_one(document)
    saved_document = await get_farm_record_collection().find_one({"_id": result.inserted_id})
    return _serialize_record(saved_document)


async def update_record(record_id: str, payload: FarmRecordUpdate) -> FarmRecordResponse:
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record id.")

    collection = get_farm_record_collection()
    existing_document = await collection.find_one({"_id": ObjectId(record_id)})
    if not existing_document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")

    update_payload = payload.model_dump(exclude_unset=True)
    mapping = {
        "crop_name": "crop_name",
        "crop_season": "crop_season",
        "area_cultivated": "area_cultivated",
        "soil_type": "soil_type",
        "previous_yield": "previous_yield",
        "current_yield": "current_yield",
        "fertilizer_usage": "fertilizer_usage",
        "irrigation_source": "irrigation_source",
        "pest_incidents": "pest_incidents",
        "annual_farm_income": "annual_farm_income",
    }

    db_update = {mapping[key]: value for key, value in update_payload.items()}
    db_update["updated_at"] = datetime.now(timezone.utc)
    await collection.update_one({"_id": ObjectId(record_id)}, {"$set": db_update})
    saved_document = await collection.find_one({"_id": ObjectId(record_id)})
    return _serialize_record(saved_document)


async def delete_record(record_id: str) -> None:
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record id.")

    result = await get_farm_record_collection().delete_one({"_id": ObjectId(record_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm record not found.")