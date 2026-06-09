# DataAnchor — Project Handoff Document
### Current Status as of 08 June 2026
**Author: Vaibhav Talekar**

---

## 1. Project Summary

DataAnchor is a **data migration validator** — not a migration tool.
It validates whether data was migrated correctly by comparing source and target systems.

**Tagline:** "Migrate Confidently. Validate Completely."

**Tech Stack:**
- Frontend: React + Vite + Tailwind CSS + React Router + Axios + Lucide React
- Backend: FastAPI + Python + Pandas + SQLAlchemy
- AI: Groq API (BYOK — Bring Your Own Key)
- Deployment target: Vercel (frontend) + Render (backend)

---

## 2. Project Structure

```
DataAnchor/
├── frontend/                          # React frontend
│   ├── src/
│   │   ├── App.jsx                    # Main app with routing — DONE
│   │   ├── main.jsx                   # Entry point — DONE
│   │   ├── index.css                  # Tailwind import — DONE
│   │   └── pages/
│   │       ├── Validate.jsx           # Validation form page — DONE
│   │       └── Results.jsx            # Results dashboard — DONE
│   ├── package.json
│   └── vite.config.js                 # Tailwind + Vite config — DONE
│
└── backend/                           # FastAPI backend
    ├── main.py                        # FastAPI app entry point — DONE
    ├── routers/
    │   ├── __init__.py                # DONE
    │   └── validate.py                # Validation endpoint — DONE
    ├── connectors/                    # EMPTY — not built yet
    ├── validators/                    # EMPTY — not built yet
    ├── ai/                            # EMPTY — not built yet
    ├── reports/                       # EMPTY — not built yet
    ├── models/                        # EMPTY — not built yet
    ├── .env                           # DONE
    └── requirements.txt               # DONE
```

---

## 3. What is DONE

### Frontend
- Landing page (App.jsx) — dark theme, hero, features, migration paths grid, security note, footer
- React Router setup with 3 routes: `/`, `/validate`, `/results`
- Validate page (Validate.jsx):
  - Source and target connection forms
  - Supports CSV, Excel, MySQL, PostgreSQL, Snowflake, AWS RDS, BigQuery, MSSQL
  - File upload for CSV/Excel
  - DB connection fields for database types (host, port, database, table, username, password)
  - Validation checks toggles (schema, row_count, data_types, nulls, duplicates, sample_rows)
  - AI Insights toggle with BYOK Groq API key input
  - Run Validation button with loading state
  - Error display
- Results page (Results.jsx):
  - Overall migration health score (big number, color coded)
  - Per-check score cards (green/yellow/red)
  - Row count comparison
  - Schema comparison with missing columns
  - Data type mismatches table
  - NULL mismatches table
  - Duplicate records comparison
  - Run Another Validation button

### Backend
- FastAPI app running on port 8000
- CORS configured for http://localhost:5173
- `/validate` POST endpoint working
- Validation engine in `routers/validate.py` supports:
  - CSV file upload and parsing
  - Excel file upload and parsing
  - Row count validation
  - Schema validation (column comparison)
  - Data type validation
  - NULL value comparison
  - Duplicate detection
  - Overall health score calculation (weighted average)
  - Status: PASS (>=95%), WARNING (>=80%), FAIL (<80%)

### Tested and Working
- CSV to CSV validation — fully working
- Health score calculation — working
- Results dashboard displaying correctly
- Tested with 21,664 row dataset — got 99.98% score
- Duplicate detection working (detected 27 duplicates)

---

## 4. What is NOT Done Yet

### Priority 1 — Complete these to make portfolio-ready:

**1. PDF Export (frontend + backend)**
- Add "Download PDF Report" button to Results.jsx
- Backend: create `reports/pdf_generator.py` using ReportLab
- Should generate a professional audit report with all validation results
- Endpoint: GET /report/{migration_id}

**2. Groq AI Insights (BYOK)**
- Create `ai/groq_service.py`
- When ai_enabled=true and groq_key is provided, call Groq API
- Three AI features:
  - Column mapper: auto-map renamed/similar columns between source and target
  - Mismatch summarizer: plain English summary of issues found
  - Fix recommender: suggest how to fix each mismatch
- Model to use: llama3-8b-8192 (fast and free on Groq)
- The groq_key should NEVER be stored — session only
- Add AI insights section to Results.jsx

**3. Deployment**
- Frontend: deploy to Vercel
  - Add `vercel.json` to frontend folder
  - Set environment variable: VITE_API_URL=https://your-backend.onrender.com
- Backend: deploy to Render
  - Add `render.yaml` to backend folder
  - Set environment variables: GROQ_API_KEY, ALLOWED_ORIGINS
  - Note: Render free tier has cold starts — add loading state

### Priority 2 — Add after deployment:

**4. Database Connectors**
Currently only CSV/Excel works. Need to build actual DB connectors:

- `connectors/mysql_connector.py` — using pymysql
- `connectors/postgres_connector.py` — using psycopg2
- `connectors/snowflake_connector.py` — using snowflake-connector-python
- `connectors/aws_rds_connector.py` — using boto3 + psycopg2
- `connectors/bigquery_connector.py` — using google-cloud-bigquery

Each connector should:
- Accept connection config (host, port, database, table, username, password)
- Return a pandas DataFrame for the specified table
- Handle connection errors gracefully
- Test connection before running full validation

**5. Test Connection Button**
- Add `POST /test-connection` endpoint
- Frontend: add "Test Connection" button next to each connection form
- Show green tick or red error after testing

**6. Sample Rows Validation**
- Currently the "sample_rows" check is toggled in UI but not implemented in backend
- Compare actual row values between source and target (first 100 rows)
- Show mismatched rows in Results page

---

## 5. Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## 6. How to Run Locally

### Backend
```bash
cd DataAnchor/backend
venv\Scripts\activate        # Windows
uvicorn main:app --reload
# Runs on http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend
```bash
cd DataAnchor/frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 7. Key Files Content Summary

### backend/main.py
- FastAPI app
- CORS middleware configured
- Imports and includes router from routers/validate.py
- Two endpoints: GET / and GET /health

### backend/routers/validate.py
- POST /validate endpoint
- Accepts multipart form data
- Handles CSV and Excel file uploads
- Runs 5 validation checks
- Returns JSON with overall_score, overall_status, and per-check results

### frontend/src/App.jsx
- BrowserRouter wrapping all routes
- Home component with landing page
- Routes to /validate and /results

### frontend/src/pages/Validate.jsx
- ConnectionForm component (reusable for source and target)
- State management for source, target, checks, aiEnabled, groqKey
- Sends FormData to backend /validate
- Navigates to /results with response data

### frontend/src/pages/Results.jsx
- Reads results from React Router location.state
- ScoreCard component for per-check scores
- StatusIcon component (green/yellow/red)
- Displays all validation results

---

## 8. Dependencies

### Backend (requirements.txt)
```
fastapi
uvicorn
sqlalchemy
pandas
openpyxl
python-dotenv
groq
psycopg2-binary
pymysql
snowflake-connector-python
pydantic
reportlab
python-multipart
aiofiles
```

### Frontend (package.json key deps)
```
react
react-dom
react-router-dom
axios
tailwindcss
@tailwindcss/vite
lucide-react
recharts
```

---

## 9. Design Decisions

1. **BYOK (Bring Your Own Key)** — AI features use user's own Groq API key, never stored
2. **Session-only credentials** — DB passwords never stored, discarded after validation
3. **Rule-based core** — validation works without AI, AI is optional enhancement
4. **Dark theme** — gray-950 background, blue-500 accent color
5. **Health score logic:**
   - PASS: >= 95%
   - WARNING: >= 80%
   - FAIL: < 80%

---

## 10. Portfolio Talking Points

When explaining this project in interviews:

1. "This came from my real banking migration experience at Saraswat Infotech where I improved data accuracy by 50-75% — I wanted to automate that entire validation process"
2. "It supports 20+ migration paths including cloud-to-cloud like AWS RDS to Snowflake"
3. "I designed it with BYOK architecture — users bring their own Groq API key so enterprise clients can use AI features without exposing sensitive data to third-party services"
4. "It generates a compliance-ready audit report which is exactly what banks need for regulatory proof"
5. "The core validation engine is rule-based so it works without any AI dependency — AI is just an optional enhancement layer"

---

## 11. Next Steps in Order

1. Build PDF export (ReportLab backend + Download button frontend)
2. Build Groq AI insights (column mapper + mismatch summary + fix recommendations)
3. Deploy frontend to Vercel
4. Deploy backend to Render
5. Build MySQL + PostgreSQL connectors
6. Build Snowflake connector
7. Add test connection button
8. Implement sample rows validation
9. Add to portfolio website with live link

---

*Handoff document prepared: 08 June 2026*
*Project location: C:\Users\KID01315\DataAnchor*
*Developer: Vaibhav Talekar | vtalekar0734@gmail.com*
