"""
Prediction Service
Orchestrates model inference, score calculation, explanation generation,
and persistent database storage.
"""

import sys
import os
from datetime import datetime
from typing import Dict, Any

# Ensure ML package is accessible
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.predict import AccidentRiskPredictor
from backend.app.database.db import db_manager
from backend.app.models.schemas import PredictionInput

class PredictionService:
    def __init__(self):
        self.predictor = AccidentRiskPredictor()
        
    def predict_risk(self, input_data: PredictionInput) -> Dict[str, Any]:
        """
        Processes prediction request, executes ML inference, formats response,
        and saves prediction history to DB.
        """
        payload = input_data.model_dump()
        
        # Execute ML inference
        pred_result = self.predictor.predict(payload)
        
        # Format response document
        timestamp = datetime.now().isoformat()
        pred_doc = {
            "timestamp": timestamp,
            "risk_level": pred_result["risk_level"],
            "risk_score": pred_result["risk_score"],
            "confidence": pred_result["confidence"],
            "confidence_percentage": pred_result["confidence_percentage"],
            "probabilities": pred_result["probabilities"],
            "model_used": pred_result["model_used"],
            "location": pred_result["location"],
            "input_features": payload,
            "explanation": pred_result["explanation"],
            "contributing_factors": pred_result["contributing_factors"],
            "safety_recommendations": pred_result["safety_recommendations"]
        }
        
        # Save to database
        try:
            pred_id = db_manager.save_prediction(pred_doc)
            pred_doc["id"] = pred_id
        except Exception as e:
            print(f"Warning: Failed to save prediction to database: {e}")
            pred_doc["id"] = f"PRED-{int(datetime.now().timestamp())}"
            
        return pred_doc

prediction_service = PredictionService()
