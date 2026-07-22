from fastapi import APIRouter, HTTPException, Query
from services.etl_service import etl_service
from typing import Dict, Any

router = APIRouter()

@router.get("/{dataset_id}")
def preview_dataset(dataset_id: str, page: int = Query(1, ge=1), page_size: int = Query(100, ge=1, le=1000)):
    try:
        preview_data = etl_service.get_preview(dataset_id, page, page_size)
        return preview_data
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
