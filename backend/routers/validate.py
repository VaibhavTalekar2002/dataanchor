from fastapi import APIRouter, UploadFile, File, Form, Response
from typing import Optional
import json
import pandas as pd
import io
from reports.pdf_generator import generate_pdf_report
from ai.groq_service import get_ai_insights

router = APIRouter()

@router.post("/validate")
async def validate(
    source_type: str = Form(...),
    target_type: str = Form(...),
    checks: str = Form(...),
    ai_enabled: str = Form("false"),
    groq_key: str = Form(""),
    source_file: Optional[UploadFile] = File(None),
    target_file: Optional[UploadFile] = File(None),
    source_config: str = Form("{}"),
    target_config: str = Form("{}")
):
    checks_dict = json.loads(checks)
    source_cfg = json.loads(source_config)
    target_cfg = json.loads(target_config)

    source_df = None
    target_df = None

    # Load source
    if source_type in ["csv", "excel"] and source_file:
        content = await source_file.read()
        if source_type == "csv":
            source_df = pd.read_csv(io.BytesIO(content))
        else:
            source_df = pd.read_excel(io.BytesIO(content))

    # Load target
    if target_type in ["csv", "excel"] and target_file:
        content = await target_file.read()
        if target_type == "csv":
            target_df = pd.read_csv(io.BytesIO(content))
        else:
            target_df = pd.read_excel(io.BytesIO(content))

    # Run validations
    results = {}
    scores = []

    # Row count
    if checks_dict.get("row_count") and source_df is not None and target_df is not None:
        src_rows = len(source_df)
        tgt_rows = len(target_df)
        score = 100 if src_rows == tgt_rows else round((min(src_rows, tgt_rows) / max(src_rows, tgt_rows)) * 100, 2)
        results["row_count"] = {
            "score": score,
            "status": "PASS" if score == 100 else "WARNING",
            "source_rows": src_rows,
            "target_rows": tgt_rows
        }
        scores.append(score)

    # Schema
    if checks_dict.get("schema") and source_df is not None and target_df is not None:
        src_cols = set(source_df.columns)
        tgt_cols = set(target_df.columns)
        missing_in_target = list(src_cols - tgt_cols)
        extra_in_target = list(tgt_cols - src_cols)
        score = round((len(src_cols & tgt_cols) / len(src_cols | tgt_cols)) * 100, 2)
        results["schema"] = {
            "score": score,
            "status": "PASS" if score == 100 else "WARNING",
            "missing_in_target": missing_in_target,
            "extra_in_target": extra_in_target,
            "source_columns": len(src_cols),
            "target_columns": len(tgt_cols)
        }
        scores.append(score)

    # Data types
    if checks_dict.get("data_types") and source_df is not None and target_df is not None:
        common_cols = list(set(source_df.columns) & set(target_df.columns))
        mismatches = []
        for col in common_cols:
            if str(source_df[col].dtype) != str(target_df[col].dtype):
                mismatches.append({
                    "column": col,
                    "source_type": str(source_df[col].dtype),
                    "target_type": str(target_df[col].dtype)
                })
        score = round(((len(common_cols) - len(mismatches)) / len(common_cols)) * 100, 2) if common_cols else 100
        results["data_types"] = {
            "score": score,
            "status": "PASS" if score == 100 else "WARNING",
            "mismatches": mismatches
        }
        scores.append(score)

    # Nulls
    if checks_dict.get("nulls") and source_df is not None and target_df is not None:
        common_cols = list(set(source_df.columns) & set(target_df.columns))
        null_mismatches = []
        for col in common_cols:
            src_nulls = int(source_df[col].isnull().sum())
            tgt_nulls = int(target_df[col].isnull().sum())
            if src_nulls != tgt_nulls:
                null_mismatches.append({
                    "column": col,
                    "source_nulls": src_nulls,
                    "target_nulls": tgt_nulls
                })
        score = round(((len(common_cols) - len(null_mismatches)) / len(common_cols)) * 100, 2) if common_cols else 100
        results["nulls"] = {
            "score": score,
            "status": "PASS" if score == 100 else "WARNING",
            "mismatches": null_mismatches
        }
        scores.append(score)

    # Duplicates
    if checks_dict.get("duplicates") and source_df is not None and target_df is not None:
        src_dups = int(source_df.duplicated().sum())
        tgt_dups = int(target_df.duplicated().sum())
        score = 100 if tgt_dups == 0 else round((1 - tgt_dups / len(target_df)) * 100, 2)
        results["duplicates"] = {
            "score": score,
            "status": "PASS" if tgt_dups == 0 else "WARNING",
            "source_duplicates": src_dups,
            "target_duplicates": tgt_dups
        }
        scores.append(score)

    overall_score = round(sum(scores) / len(scores), 2) if scores else 0
    overall_status = "PASS" if overall_score >= 95 else "WARNING" if overall_score >= 80 else "FAIL"

# AI Insights
    ai_insights = None
    if ai_enabled == "true" and groq_key:
        ai_insights = get_ai_insights({
            "overall_score": overall_score,
            "results": results
        }, groq_key)

    return {
        "overall_score": overall_score,
        "overall_status": overall_status,
        "results": results,
        "ai_insights": ai_insights
    }

from fastapi import APIRouter, UploadFile, File, Form, Response
from reports.pdf_generator import generate_pdf_report

@router.post("/validate/pdf")
async def validate_and_download_pdf(
    source_type: str = Form(...),
    target_type: str = Form(...),
    checks: str = Form(...),
    ai_enabled: str = Form("false"),
    groq_key: str = Form(""),
    source_file: Optional[UploadFile] = File(None),
    target_file: Optional[UploadFile] = File(None),
    source_config: str = Form("{}"),
    target_config: str = Form("{}")
):
    checks_dict = json.loads(checks)
    source_cfg = json.loads(source_config)
    target_cfg = json.loads(target_config)

    source_df = None
    target_df = None

    if source_type in ["csv", "excel"] and source_file:
        content = await source_file.read()
        if source_type == "csv":
            source_df = pd.read_csv(io.BytesIO(content))
        else:
            source_df = pd.read_excel(io.BytesIO(content))

    if target_type in ["csv", "excel"] and target_file:
        content = await target_file.read()
        if target_type == "csv":
            target_df = pd.read_csv(io.BytesIO(content))
        else:
            target_df = pd.read_excel(io.BytesIO(content))

    results = {}
    scores = []

    if checks_dict.get("row_count") and source_df is not None and target_df is not None:
        src_rows = len(source_df)
        tgt_rows = len(target_df)
        score = 100 if src_rows == tgt_rows else round((min(src_rows, tgt_rows) / max(src_rows, tgt_rows)) * 100, 2)
        results["row_count"] = {"score": score, "status": "PASS" if score == 100 else "WARNING", "source_rows": src_rows, "target_rows": tgt_rows}
        scores.append(score)

    if checks_dict.get("schema") and source_df is not None and target_df is not None:
        src_cols = set(source_df.columns)
        tgt_cols = set(target_df.columns)
        missing_in_target = list(src_cols - tgt_cols)
        extra_in_target = list(tgt_cols - src_cols)
        score = round((len(src_cols & tgt_cols) / len(src_cols | tgt_cols)) * 100, 2)
        results["schema"] = {"score": score, "status": "PASS" if score == 100 else "WARNING", "missing_in_target": missing_in_target, "extra_in_target": extra_in_target, "source_columns": len(src_cols), "target_columns": len(tgt_cols)}
        scores.append(score)

    if checks_dict.get("data_types") and source_df is not None and target_df is not None:
        common_cols = list(set(source_df.columns) & set(target_df.columns))
        mismatches = []
        for col in common_cols:
            if str(source_df[col].dtype) != str(target_df[col].dtype):
                mismatches.append({"column": col, "source_type": str(source_df[col].dtype), "target_type": str(target_df[col].dtype)})
        score = round(((len(common_cols) - len(mismatches)) / len(common_cols)) * 100, 2) if common_cols else 100
        results["data_types"] = {"score": score, "status": "PASS" if score == 100 else "WARNING", "mismatches": mismatches}
        scores.append(score)

    if checks_dict.get("nulls") and source_df is not None and target_df is not None:
        common_cols = list(set(source_df.columns) & set(target_df.columns))
        null_mismatches = []
        for col in common_cols:
            src_nulls = int(source_df[col].isnull().sum())
            tgt_nulls = int(target_df[col].isnull().sum())
            if src_nulls != tgt_nulls:
                null_mismatches.append({"column": col, "source_nulls": src_nulls, "target_nulls": tgt_nulls})
        score = round(((len(common_cols) - len(null_mismatches)) / len(common_cols)) * 100, 2) if common_cols else 100
        results["nulls"] = {"score": score, "status": "PASS" if score == 100 else "WARNING", "mismatches": null_mismatches}
        scores.append(score)

    if checks_dict.get("duplicates") and source_df is not None and target_df is not None:
        src_dups = int(source_df.duplicated().sum())
        tgt_dups = int(target_df.duplicated().sum())
        score = 100 if tgt_dups == 0 else round((1 - tgt_dups / len(target_df)) * 100, 2)
        results["duplicates"] = {"score": score, "status": "PASS" if tgt_dups == 0 else "WARNING", "source_duplicates": src_dups, "target_duplicates": tgt_dups}
        scores.append(score)

    overall_score = round(sum(scores) / len(scores), 2) if scores else 0
    overall_status = "PASS" if overall_score >= 95 else "WARNING" if overall_score >= 80 else "FAIL"

    result = {
        "overall_score": overall_score,
        "overall_status": overall_status,
        "results": results,
        "ai_insights": None
    }

    pdf_bytes = generate_pdf_report(result)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=dataanchor_report.pdf"}
    )

    # Generate PDF
    pdf_bytes = generate_pdf_report(result)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=dataanchor_report.pdf"}
    )

from fastapi import APIRouter, UploadFile, File, Form, Response, Request
from pydantic import BaseModel
from typing import Any

class ResultsPayload(BaseModel):
    overall_score: float
    overall_status: str
    results: dict
    ai_insights: Any = None

@router.post("/generate/pdf")
async def generate_pdf_from_results(payload: ResultsPayload):
    pdf_bytes = generate_pdf_report(payload.dict())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=dataanchor_report.pdf"}
    )