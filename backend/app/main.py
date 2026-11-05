"""
FastAPI Main Application Entrypoint
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.routes.api import router as api_router
from backend.app.database.db import db_manager
from ml.predict import AccidentRiskPredictor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure dataset exists, sync to DB, ensure model is trained/loaded
    print("\nStarting Intelligent Road Accident Risk Prediction System Backend...")
    raw_data_path = os.path.join(PROJECT_ROOT, "data", "raw", "accidents_dataset.csv")
    models_dir = os.path.join(PROJECT_ROOT, "ml", "saved_models")
    model_file = os.path.join(models_dir, "best_model.joblib")
    
    # Check if dataset and models exist; if not, generate and train automatically!
    if not os.path.exists(raw_data_path) or not os.path.exists(model_file):
        print("Initial setup detected: Generating dataset and training ML models...")
        try:
            from ml.train import run_training_pipeline
            run_training_pipeline()
        except Exception as e:
            print(f"Error during auto-training on startup: {e}")
            
    # Sync accidents to database
    try:
        db_manager.sync_dataset_if_empty(raw_data_path)
    except Exception as e:
        print(f"Warning: Failed to sync accidents dataset to DB: {e}")
        
    yield
    
    print("Shutting down backend...")

app = FastAPI(
    title="Intelligent Road Accident Risk Prediction API",
    description="Machine Learning + Geospatial Analytics for Proactive Road Safety",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server (port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "system": "Intelligent Road Accident Risk Prediction System",
        "status": "online",
        "docs_url": "/docs",
        "api_base": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
