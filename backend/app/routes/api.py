"""
REST API Endpoints for Intelligent Road Accident Risk Prediction System
"""

import os
import sys
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks

from backend.app.models.schemas import (
    PredictionInput,
    PredictionResponse,
    AccidentRecord,
    RiskZone,
    ModelPerformanceResponse
)
from backend.app.services.prediction_service import prediction_service
from backend.app.services.analytics_service import analytics_service
from backend.app.database.db import db_manager

router = APIRouter(prefix="/api", tags=["Road Accident Risk API"])

@router.get("/health")
def health_check():
    """System health and status check."""
    return {
        "status": "healthy",
        "service": "Intelligent Road Accident Risk Prediction API",
        "version": "1.0.0",
        "database": "MongoDB" if db_manager.use_mongo else "SQLite (Portable Mode)",
        "model_loaded": prediction_service.predictor.model is not None
    }

@router.post("/predict", response_model=PredictionResponse)
def predict_accident_risk(input_data: PredictionInput):
    """
    Predicts road accident risk level (Low, Medium, High) and continuous risk score (0-100)
    for specified location and environmental/road conditions.
    """
    try:
        result = prediction_service.predict_risk(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/predictions")
def get_prediction_history(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0)
):
    """Retrieves previous prediction records with timestamp and feature details."""
    try:
        records = db_manager.get_predictions(limit=limit, skip=skip)
        return {
            "total": len(records),
            "predictions": records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch predictions: {str(e)}")

@router.delete("/predictions")
def clear_predictions():
    """Clears all stored prediction history."""
    try:
        db_manager.clear_predictions()
        return {"status": "success", "message": "Prediction history cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear predictions: {str(e)}")

@router.get("/accidents")
def get_accidents(
    weather: Optional[str] = Query(None),
    traffic: Optional[str] = Query(None),
    road_condition: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    road_type: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=10000),
    skip: int = Query(0, ge=0)
):
    """Retrieves historical accident records with optional multi-attribute filters."""
    try:
        filters = {}
        if weather and weather != "All":
            filters["weather_condition"] = weather
        if traffic and traffic != "All":
            filters["traffic_density"] = traffic
        if road_condition and road_condition != "All":
            filters["road_condition"] = road_condition
        if risk_level and risk_level != "All":
            filters["risk_level"] = risk_level
        if road_type and road_type != "All":
            filters["road_type"] = road_type
            
        accidents = db_manager.get_accidents(filters=filters, limit=limit, skip=skip)
        return {
            "count": len(accidents),
            "accidents": accidents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch accidents: {str(e)}")

@router.get("/statistics")
def get_statistics():
    """Returns comprehensive dynamic statistical aggregations for dashboard charts."""
    try:
        stats = analytics_service.get_dashboard_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate statistics: {str(e)}")

@router.get("/risk-zones")
def get_risk_zones():
    """Returns spatial clustered risk zone sectors with coordinates, average score, and counts."""
    try:
        zones = analytics_service.get_risk_zones()
        return {
            "total_zones": len(zones),
            "zones": zones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch risk zones: {str(e)}")

@router.get("/model-performance")
def get_model_performance():
    """Returns comparative metrics (Accuracy, Precision, Recall, F1) for all 4 models and confusion matrices."""
    try:
        performance = analytics_service.get_model_performance()
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model metrics: {str(e)}")

@router.get("/feature-importance")
def get_feature_importance():
    """Returns feature importance rankings for the trained models."""
    try:
        perf = analytics_service.get_model_performance()
        return {
            "best_model": perf.get("best_model_name"),
            "feature_importance": perf.get("feature_importance", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feature importance: {str(e)}")

@router.post("/train")
def trigger_training(background_tasks: BackgroundTasks):
    """Triggers complete ML retraining in the background."""
    from ml.train import run_training_pipeline
    
    def train_task():
        print("Starting asynchronous background model retraining...")
        run_training_pipeline()
        prediction_service.predictor._load_artifacts()
        print("Model retraining and reload completed.")
        
    background_tasks.add_task(train_task)
    return {
        "status": "training_started",
        "message": "Model training pipeline triggered in background."
    }
