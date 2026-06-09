from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.validate import router as validate_router
import os

load_dotenv()

app = FastAPI(
    title="DataAnchor API",
    description="Migrate Confidently. Validate Completely.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(validate_router)

@app.get("/")
def root():
    return {"message": "DataAnchor API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}