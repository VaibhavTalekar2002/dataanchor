from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io
from datetime import datetime

def generate_pdf_report(results: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # Title Style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=6,
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER,
        spaceAfter=4
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#1e3a5f'),
        spaceBefore=14,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        spaceAfter=4
    )

    # Header
    elements.append(Paragraph("DataAnchor", title_style))
    elements.append(Paragraph("Migration Validation Audit Report", subtitle_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}", subtitle_style))
    elements.append(Spacer(1, 0.3*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
    elements.append(Spacer(1, 0.4*cm))

    # Overall Score
    overall_score = results.get("overall_score", 0)
    overall_status = results.get("overall_status", "UNKNOWN")
    status_color = '#16a34a' if overall_status == "PASS" else '#d97706' if overall_status == "WARNING" else '#dc2626'

    score_style = ParagraphStyle(
        'Score',
        parent=styles['Normal'],
        fontSize=28,
        textColor=colors.HexColor(status_color),
        alignment=TA_CENTER,
        spaceAfter=16
    )

    status_style = ParagraphStyle(
        'Status',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor(status_color),
        alignment=TA_CENTER,
        spaceAfter=4
    )

    elements.append(Paragraph("Overall Migration Health Score", subtitle_style))
    elements.append(Paragraph(f"{overall_score}%", score_style))
    elements.append(Paragraph(overall_status, status_style))
    elements.append(Spacer(1, 0.4*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))

    # Per Check Summary Table
    elements.append(Paragraph("Validation Summary", heading_style))

    summary_data = [["Check", "Score", "Status"]]
    for key, val in results.get("results", {}).items():
        score = val.get("score", 0)
        status = val.get("status", "")
        summary_data.append([
            key.replace("_", " ").upper(),
            f"{score}%",
            status
        ])

    summary_table = Table(summary_data, colWidths=[8*cm, 4*cm, 4*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f9fafb'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)

    # Detailed Results
    res = results.get("results", {})

    # Row Count
    if "row_count" in res:
        elements.append(Paragraph("Row Count Validation", heading_style))
        rc = res["row_count"]
        rc_data = [
            ["Metric", "Value"],
            ["Source Rows", str(rc.get("source_rows", 0))],
            ["Target Rows", str(rc.get("target_rows", 0))],
            ["Score", f"{rc.get('score', 0)}%"],
            ["Status", rc.get("status", "")]
        ]
        rc_table = Table(rc_data, colWidths=[8*cm, 8*cm])
        rc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(rc_table)

    # Schema
    if "schema" in res:
        elements.append(Paragraph("Schema Validation", heading_style))
        sc = res["schema"]
        sc_data = [
            ["Metric", "Value"],
            ["Source Columns", str(sc.get("source_columns", 0))],
            ["Target Columns", str(sc.get("target_columns", 0))],
            ["Missing in Target", ", ".join(sc.get("missing_in_target", [])) or "None"],
            ["Extra in Target", ", ".join(sc.get("extra_in_target", [])) or "None"],
            ["Score", f"{sc.get('score', 0)}%"],
        ]
        sc_table = Table(sc_data, colWidths=[8*cm, 8*cm])
        sc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(sc_table)

    # Data Types
    if "data_types" in res and res["data_types"].get("mismatches"):
        elements.append(Paragraph("Data Type Mismatches", heading_style))
        dt_data = [["Column", "Source Type", "Target Type"]]
        for m in res["data_types"]["mismatches"]:
            dt_data.append([m["column"], m["source_type"], m["target_type"]])
        dt_table = Table(dt_data, colWidths=[6*cm, 5*cm, 5*cm])
        dt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(dt_table)

    # Duplicates
    if "duplicates" in res:
        elements.append(Paragraph("Duplicate Records", heading_style))
        dup = res["duplicates"]
        dup_data = [
            ["Metric", "Value"],
            ["Source Duplicates", str(dup.get("source_duplicates", 0))],
            ["Target Duplicates", str(dup.get("target_duplicates", 0))],
            ["Status", dup.get("status", "")]
        ]
        dup_table = Table(dup_data, colWidths=[8*cm, 8*cm])
        dup_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(dup_table)
# AI Insights
    ai_insights = results.get("ai_insights")
    if ai_insights:
        elements.append(Paragraph("AI Insights", heading_style))
        
        summary_style = ParagraphStyle(
            'Summary',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8,
            leading=16
        )
        
        elements.append(Paragraph(ai_insights.get("summary", ""), summary_style))
        
        recommendations = ai_insights.get("recommendations", [])
        if recommendations:
            elements.append(Paragraph("Recommendations:", ParagraphStyle(
                'RecHeading',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#1e40af'),
                fontName='Helvetica-Bold',
                spaceAfter=4
            )))
            for rec in recommendations:
                elements.append(Paragraph(
                    f"→ {rec}",
                    ParagraphStyle(
                        'Rec',
                        parent=styles['Normal'],
                        fontSize=9,
                        textColor=colors.HexColor('#374151'),
                        spaceAfter=4,
                        leftIndent=10,
                        leading=14
                    )
                ))
    # Footer
    elements.append(Spacer(1, 0.5*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph("Generated by DataAnchor — Migrate Confidently. Validate Completely.", subtitle_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()