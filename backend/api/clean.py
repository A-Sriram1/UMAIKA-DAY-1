from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.etl_service import etl_service
from typing import List

router = APIRouter()

class CleanRequest(BaseModel):
    dataset_id: str
    operations: List[str]

@router.post("/")
def clean_dataset(request: CleanRequest):
    try:
        result = etl_service.clean_dataset(request.dataset_id, request.operations)
        return result
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
