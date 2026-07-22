from fastapi import APIRouter, UploadFile, File, HTTPException
from services.etl_service import etl_service
from typing import List

router = APIRouter()

@router.post("/")
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
            continue
            
        content = await file.read()
        try:
            dataset_id = etl_service.save_upload(file.filename, content)
            dataset_info = etl_service.datasets[dataset_id]
            results.append(dataset_info)
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})
            
    return {"message": f"{len(results)} files processed", "datasets": results}

@router.get("/status")
def get_upload_status():
    return {"datasets": list(etl_service.datasets.values())}
