from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.etl_service import etl_service
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
import io
from datetime import datetime

router = APIRouter()

@router.get("/{dataset_id}/pdf")
def generate_report(dataset_id: str):
    try:
        df = etl_service.get_dataset(dataset_id)
        meta = etl_service.datasets.get(dataset_id, {})
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=22,
            textColor=colors.HexColor('#1a56db'),
            spaceAfter=12
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e429f'),
            spaceAfter=8
        )

        elements.append(Paragraph("Digital Banking ETL Platform", title_style))
        elements.append(Paragraph("Technical Report", styles['Heading2']))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 0.5*cm))

        # Section 1: Project Objective
        elements.append(Paragraph("1. Project Objective", heading_style))
        elements.append(Paragraph(
            "This report documents the ETL (Extract, Transform, Load) workflow applied to the digital banking "
            "dataset. The goal is to clean, validate, and transform raw data into a Power BI-ready star schema "
            "master dataset for analysis and reporting purposes.",
            styles['Normal']
        ))
        elements.append(Spacer(1, 0.4*cm))

        # Section 2: Dataset Summary
        elements.append(Paragraph("2. Dataset Summary", heading_style))
        summary_data = [
            ["Property", "Value"],
            ["Original Filename", meta.get("original_filename", "N/A")],
            ["Total Rows", str(len(df))],
            ["Total Columns", str(len(df.columns))],
            ["Dataset ID", dataset_id],
        ]
        t = Table(summary_data, colWidths=[7*cm, 10*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0f4ff'), colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.4*cm))

        # Section 3: Column Analysis
        elements.append(Paragraph("3. Column Analysis", heading_style))
        col_data = [["Column Name", "Data Type", "Missing Values", "Unique Values"]]
        for col in df.columns:
            col_data.append([
                col,
                str(df[col].dtype),
                str(df[col].isna().sum()),
                str(df[col].nunique())
            ])
        t2 = Table(col_data, colWidths=[6*cm, 4*cm, 4*cm, 3*cm])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0f4ff'), colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 0.4*cm))

        # Section 4: Data Quality
        elements.append(Paragraph("4. Data Quality Assessment", heading_style))
        total_cells = df.size
        missing = int(df.isna().sum().sum())
        quality_score = round(max(0, 100 - (missing / total_cells * 100)), 2) if total_cells > 0 else 100
        dupe_count = int(df.duplicated().sum())
        elements.append(Paragraph(
            f"• Total Records: {len(df)}<br/>"
            f"• Duplicate Rows: {dupe_count}<br/>"
            f"• Total Missing Values: {missing}<br/>"
            f"• Data Quality Score: {quality_score}%",
            styles['Normal']
        ))
        elements.append(Spacer(1, 0.4*cm))

        # Section 5: Star Schema Design
        elements.append(Paragraph("5. Star Schema Design", heading_style))
        elements.append(Paragraph(
            "The cleaned dataset is structured into a star schema optimized for OLAP queries and Power BI dashboards:",
            styles['Normal']
        ))
        elements.append(Paragraph(
            "• <b>Fact_Transactions</b>: Central fact table with transaction records<br/>"
            "• <b>DimCustomer</b>: Customer attributes and demographics<br/>"
            "• <b>DimProduct</b>: Banking product attributes<br/>"
            "• <b>DimBranch</b>: Branch locations and metadata<br/>"
            "• <b>DimChannel</b>: Digital channel information<br/>"
            "• <b>DimDate</b>: Date hierarchy (Year, Quarter, Month, Day)",
            styles['Normal']
        ))
        elements.append(Spacer(1, 0.4*cm))

        # Section 6: ETL Workflow
        elements.append(Paragraph("6. ETL Workflow Summary", heading_style))
        elements.append(Paragraph(
            "1. <b>Extract</b>: Files uploaded via the platform (CSV / Excel).<br/>"
            "2. <b>Validate</b>: Initial quality checks — missing values, type detection.<br/>"
            "3. <b>Transform</b>: Pandas transformations applied — deduplication, null filling, text normalization.<br/>"
            "4. <b>Clean</b>: Column normalization, whitespace trimming, date standardization.<br/>"
            "5. <b>Merge</b>: Datasets joined and mapped to star schema.<br/>"
            "6. <b>Load</b>: Stored in PostgreSQL database.<br/>"
            "7. <b>Export</b>: Ready for download as CSV, Excel, SQL, or Power BI-compatible format.",
            styles['Normal']
        ))
        elements.append(Spacer(1, 0.4*cm))

        # Footer
        elements.append(Paragraph("— End of Report —", styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ETL_Report_{dataset_id[:8]}.pdf"}
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
