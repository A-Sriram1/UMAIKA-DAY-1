from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import upload, preview, clean, schema, validate, export, report

app = FastAPI(
    title="Digital Banking ETL API",
    description="Backend API for the Digital Banking Adoption and User Experience Optimization ETL Platform",
    version="1.0.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(preview.router, prefix="/api/preview", tags=["Preview"])
app.include_router(clean.router, prefix="/api/clean", tags=["Clean"])
app.include_router(schema.router, prefix="/api/schema", tags=["Schema"])
app.include_router(validate.router, prefix="/api/validate", tags=["Validate"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])

@app.get("/")
def root():
    return {"message": "Welcome to the Digital Banking ETL API"}
