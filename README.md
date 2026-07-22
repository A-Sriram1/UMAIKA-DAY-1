# Digital Banking ETL Platform

A production-ready full-stack ETL web application for the **Digital Banking Adoption and User Experience Optimization** project.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Recharts |
| Backend | FastAPI, Python, Pandas, OpenPyXL, ReportLab |
| Database | PostgreSQL (via Docker) |

## Project Structure

```
.
├── docker-compose.yml          # PostgreSQL container
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt
│   ├── api/
│   │   ├── upload.py           # POST /api/upload
│   │   ├── preview.py          # GET  /api/preview/{id}
│   │   ├── clean.py            # POST /api/clean
│   │   ├── schema.py           # POST /api/schema/generate
│   │   ├── validate.py         # GET  /api/validate/{id}
│   │   ├── export.py           # GET  /api/export/{id}/{format}
│   │   └── report.py           # GET  /api/report/{id}/pdf
│   └── services/
│       └── etl_service.py      # Core Pandas ETL logic
└── frontend/                   # Next.js 15 App
    └── src/
        └── app/
            ├── page.tsx              # Dashboard
            ├── upload/page.tsx
            ├── preview/page.tsx
            ├── clean/page.tsx
            ├── schema/page.tsx
            ├── validation/page.tsx
            ├── pipeline/page.tsx
            └── export/page.tsx
```

## Quick Start

### 1. Start the Database
```bash
docker-compose up -d
```

### 2. Start the Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- 📤 **Upload** Excel & CSV datasets (Customer, Transactions, Branches, Products, Digital Channels, Calendar)
- 🔍 **Preview** data with pagination, sorting, filtering, and column statistics
- 🧹 **Clean** data automatically — duplicates, nulls, whitespace, type issues
- ⭐ **Star Schema** auto-generation with interactive relationship diagram
- ✅ **Validation** reports with Data Quality Score
- 🔄 **ETL Pipeline** animated workflow visualization
- 📤 **Export** as CSV, Excel, SQL, or Power BI-ready dataset
- 📄 **Technical Report** PDF generation with ReportLab
