from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.etl_service import etl_service
import pandas as pd
import io

router = APIRouter()

@router.get("/{dataset_id}/csv")
def export_csv(dataset_id: str):
    try:
        df = etl_service.get_dataset(dataset_id)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            io.BytesIO(buffer.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=export_{dataset_id}.csv"}
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")

@router.get("/{dataset_id}/excel")
def export_excel(dataset_id: str):
    try:
        df = etl_service.get_dataset(dataset_id)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Data')
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=export_{dataset_id}.xlsx"}
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")

@router.get("/{dataset_id}/sql")
def export_sql(dataset_id: str):
    try:
        df = etl_service.get_dataset(dataset_id)
        table_name = f"dataset_{dataset_id.replace('-', '_')[:8]}"
        
        # Build CREATE TABLE + INSERT statements
        col_defs = []
        for col, dtype in df.dtypes.items():
            safe_col = col.replace(" ", "_")
            if "int" in str(dtype):
                col_defs.append(f"    {safe_col} BIGINT")
            elif "float" in str(dtype):
                col_defs.append(f"    {safe_col} DOUBLE PRECISION")
            else:
                col_defs.append(f"    {safe_col} TEXT")
        
        sql_lines = [f"CREATE TABLE IF NOT EXISTS {table_name} ("]
        sql_lines.append(",\n".join(col_defs))
        sql_lines.append(");\n")
        
        for _, row in df.iterrows():
            vals = []
            for v in row:
                if pd.isna(v):
                    vals.append("NULL")
                elif isinstance(v, str):
                    escaped = v.replace("'", "''")
                    vals.append(f"'{escaped}'")
                else:
                    vals.append(str(v))
            sql_lines.append(f"INSERT INTO {table_name} VALUES ({', '.join(vals)});")
        
        sql_content = "\n".join(sql_lines)
        return StreamingResponse(
            io.BytesIO(sql_content.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=export_{dataset_id}.sql"}
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")
