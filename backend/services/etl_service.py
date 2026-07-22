import os
import pandas as pd
from typing import Dict, Any, List
import uuid

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

class ETLService:
    def __init__(self):
        # In a real production app, this metadata would be in PostgreSQL
        # For this prototype, we store metadata in memory and data in parquet files
        self.datasets: Dict[str, Dict[str, Any]] = {}

    def save_upload(self, filename: str, content: bytes) -> str:
        file_ext = filename.split(".")[-1].lower()
        dataset_id = str(uuid.uuid4())
        
        file_path = os.path.join(DATA_DIR, f"{dataset_id}.{file_ext}")
        with open(file_path, "wb") as f:
            f.write(content)
            
        try:
            if file_ext == "csv":
                df = pd.read_csv(file_path)
            elif file_ext in ["xls", "xlsx"]:
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported file format")
                
            # Save as parquet for faster subsequent reads
            parquet_path = os.path.join(DATA_DIR, f"{dataset_id}.parquet")
            df.to_parquet(parquet_path)
            
            # Store metadata
            self.datasets[dataset_id] = {
                "id": dataset_id,
                "original_filename": filename,
                "parquet_path": parquet_path,
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "status": "Uploaded"
            }
            
            return dataset_id
            
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e

    def get_dataset(self, dataset_id: str) -> pd.DataFrame:
        if dataset_id not in self.datasets:
            raise KeyError("Dataset not found")
        return pd.read_parquet(self.datasets[dataset_id]["parquet_path"])
        
    def save_dataset(self, dataset_id: str, df: pd.DataFrame):
        if dataset_id not in self.datasets:
            raise KeyError("Dataset not found")
        parquet_path = self.datasets[dataset_id]["parquet_path"]
        df.to_parquet(parquet_path)
        self.datasets[dataset_id]["rows"] = len(df)
        self.datasets[dataset_id]["columns"] = len(df.columns)
        self.datasets[dataset_id]["column_names"] = list(df.columns)

    def get_preview(self, dataset_id: str, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
        df = self.get_dataset(dataset_id)
        start = (page - 1) * page_size
        end = start + page_size
        
        preview_df = df.iloc[start:end]
        
        # Calculate column stats
        column_stats = []
        for col in df.columns:
            column_stats.append({
                "name": col,
                "type": str(df[col].dtype),
                "unique": int(df[col].nunique()),
                "missing": int(df[col].isna().sum())
            })
            
        return {
            "data": preview_df.to_dict(orient="records"),
            "total_rows": len(df),
            "total_pages": (len(df) + page_size - 1) // page_size,
            "column_stats": column_stats,
            "duplicate_count": int(df.duplicated().sum())
        }
        
    def clean_dataset(self, dataset_id: str, operations: List[str]) -> Dict[str, Any]:
        df = self.get_dataset(dataset_id)
        original_rows = len(df)
        
        if "remove_duplicates" in operations:
            df = df.drop_duplicates()
            
        if "fill_missing" in operations:
            # Simple fill strategy: forward-fill then back-fill
            df = df.ffill().bfill()
            
        if "trim_spaces" in operations:
            # Trim string columns
            str_cols = df.select_dtypes(include=['object']).columns
            for col in str_cols:
                df[col] = df[col].astype(str).str.strip()
                
        if "normalize_columns" in operations:
            df.columns = [c.strip().replace(" ", "_").lower() for c in df.columns]
            
        self.save_dataset(dataset_id, df)
        
        return {
            "message": "Dataset cleaned successfully",
            "original_rows": original_rows,
            "new_rows": len(df),
            "rows_removed": original_rows - len(df)
        }

etl_service = ETLService()
