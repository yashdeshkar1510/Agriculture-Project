from fastapi import APIRouter, status

from backend.models.farm_record import FarmRecordCreate, FarmRecordResponse, FarmRecordUpdate
from backend.services.farm_records import create_record, delete_record, get_record, list_records, update_record


router = APIRouter(prefix="/farm-records", tags=["Farm Records"])


@router.get("", response_model=list[FarmRecordResponse])
async def get_farm_records():
    return await list_records()


@router.get("/{record_id}", response_model=FarmRecordResponse)
async def get_farm_record(record_id: str):
    return await get_record(record_id)


@router.post("", response_model=FarmRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_farm_record(payload: FarmRecordCreate):
    return await create_record(payload)


@router.put("/{record_id}", response_model=FarmRecordResponse)
async def update_farm_record(record_id: str, payload: FarmRecordUpdate):
    return await update_record(record_id, payload)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_farm_record(record_id: str):
    await delete_record(record_id)
    return None