# DataAnchor — Migrate Confidently. Validate Completely.


**DataAnchor** is an AI-powered data migration validator that ensures your data arrives at its destination accurately, completely, and reliably. It supports 20+ migration paths across files, relational databases, cloud databases, and data warehouses.

> 🔗 **Live Demo:** [dataanchor.vercel.app](https://dataanchor.vercel.app)  
> 🔗 **Backend API:** [dataanchor-backend.onrender.com](https://dataanchor-backend.onrender.com)

---

## What is DataAnchor?

Every data migration carries risk — rows get lost, columns get renamed, data types change silently, and duplicates appear. Traditional validation is manual, time-consuming, and error-prone.

DataAnchor automates the entire validation process — comparing your source and target systems and generating a professional audit report with a migration health score.

---

## Features

- **20+ Migration Paths** — CSV, Excel, MySQL, PostgreSQL, Snowflake, AWS RDS, BigQuery, MS SQL Server
- **Automated Validation** — Schema, row count, data types, NULL comparison, duplicate detection
- **Migration Health Score** — Overall % score with PASS / WARNING / FAIL status
- **AI Insights (BYOK)** — Bring your own Groq API key for AI-powered mismatch analysis and fix recommendations
- **PDF Audit Report** — Download a professional compliance-ready audit report
- **Enterprise Safe** — Credentials never stored, session-only connections, BYOK architecture

---

## Supported Migration Paths

| Source | Target |
|--------|--------|
| CSV / Excel | MySQL, PostgreSQL, Snowflake, BigQuery |
| MySQL | PostgreSQL, Snowflake, AWS RDS, BigQuery |
| PostgreSQL | MySQL, Snowflake, AWS RDS, BigQuery |
| AWS RDS | Snowflake, BigQuery, Redshift |
| Snowflake | BigQuery |
| MS SQL Server | MySQL, PostgreSQL, AWS RDS |

---

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- FastAPI (Python)
- Pandas
- SQLAlchemy
- ReportLab (PDF generation)
- Groq API (BYOK AI insights)

### Deployment
- Frontend → Vercel
- Backend → Render

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

Run backend:
```bash
uvicorn main:app --reload
# API runs on http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```
VITE_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
# Runs on http://localhost:5173
```

---

## How It Works

1. **Connect** your source and target systems
2. **Configure** which validation checks to run
3. **Enable AI** (optional) — paste your own Groq API key
4. **Run Validation** — DataAnchor compares source vs target
5. **Review Results** — health score, per-check breakdown, AI insights
6. **Download PDF** — compliance-ready audit report

---

## Validation Checks

| Check | Description |
|-------|-------------|
| Schema | Compares column names between source and target |
| Row Count | Verifies total rows match |
| Data Types | Detects type mismatches per column |
| NULL Values | Compares NULL counts per column |
| Duplicates | Detects duplicate records in target |

---

## Health Score Logic

| Score | Status |
|-------|--------|
| 95–100% | ✅ PASS |
| 80–94% | ⚠️ WARNING |
| 0–79% | ❌ FAIL |

---

## AI Insights (BYOK)

DataAnchor uses a **Bring Your Own Key** architecture for AI features:

- Your Groq API key is **never stored** — session only
- Enterprise clients can use AI features without exposing data to third-party services
- Provides plain English summary of issues and fix recommendations
- Uses `llama-3.1-8b-instant` model via Groq API

---

## Project Background

This project was inspired by real banking migration experience — manually validating data accuracy across 3 bank databases during core banking software deployments. DataAnchor automates that entire process.

---

## Screenshots

| Landing Page | Validation Form | Results Dashboard |
|-------------|-----------------|-------------------|
| Dark theme hero | Source + target config | Health score + per-check breakdown |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

MIT

---

**Built by [Vaibhav Talekar](https://vaibhav-portfolio-indol-three.vercel.app/) — Data Analyst & BI Developer**
