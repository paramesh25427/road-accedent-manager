"""
Prediction Module
Loads the trained ML model and preprocessor pipeline to produce:
1. Risk Level (Low, Medium, High)
2. Risk Score (0 - 100)
3. Confidence Probability
4. Transparent, feature-driven risk factor explanation & recommendations
"""

import os
import joblib
import numpy as np
import pandas as pd
from .preprocess import INVERSE_LABEL_MAPPING

class AccidentRiskPredictor:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), "saved_models")
            
        self.model_dir = model_dir
        self.model = None
        self.preprocessor = None
        self.model_metadata = None
        self._load_artifacts()
        
    def _load_artifacts(self):
        model_path = os.path.join(self.model_dir, "best_model.joblib")
        preprocessor_path = os.path.join(self.model_dir, "preprocessor.joblib")
        
        if os.path.exists(model_path) and os.path.exists(preprocessor_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            print("Successfully loaded ML model and preprocessor pipeline.")
        else:
            print("Warning: ML model artifacts not found. Please train models first using ml/train.py")
            
    def predict(self, input_data: dict) -> dict:
        """
        Takes raw dictionary input and returns complete risk prediction object.
        """
        if self.model is None or self.preprocessor is None:
            self._load_artifacts()
            if self.model is None:
                raise RuntimeError("ML model is not loaded. Train model using ml/train.py first.")
                
        df_input = pd.DataFrame([input_data])
        
        # Transform features
        X_processed = self.preprocessor.transform(df_input)
        
        # Predict class & probabilities
        pred_class_idx = int(self.model.predict(X_processed)[0])
        probabilities = self.model.predict_proba(X_processed)[0]
        
        risk_level = INVERSE_LABEL_MAPPING.get(pred_class_idx, "Medium")
        confidence = float(np.max(probabilities))
        
        prob_dict = {
            "Low": round(float(probabilities[0]), 4),
            "Medium": round(float(probabilities[1]), 4),
            "High": round(float(probabilities[2]), 4)
        }
        
        # Calculate continuous Risk Score (0 - 100)
        # Derived from probability distribution: score = P(Low)*18 + P(Med)*55 + P(High)*90 + adjustment
        expected_score = float(probabilities[0] * 18.0 + probabilities[1] * 55.0 + probabilities[2] * 90.0)
        
        # Fine-tune score with specific physical factors
        adj = 0.0
        if input_data.get("road_condition") in ["Damaged", "Icy"]:
            adj += 4.0
        if input_data.get("weather_condition") in ["Foggy", "Stormy"]:
            adj += 4.0
        if input_data.get("traffic_density") == "High":
            adj += 3.0
        if float(input_data.get("visibility", 5.0)) < 1.0:
            adj += 4.0
        if int(input_data.get("speed_limit", 60)) >= 100:
            adj += 3.0
            
        final_risk_score = round(max(5.0, min(99.0, expected_score + adj)), 1)
        
        # Generate transparent risk factors and human explanation
        explanation_data = self._generate_explanation(input_data, risk_level, final_risk_score, prob_dict)
        
        model_name = getattr(self.model, "__class__", type("x", (), {"__name__": "Ensemble"} )).__name__
        if "XGB" in model_name:
            friendly_model_name = "XGBoost Classifier"
        elif "RandomForest" in model_name:
            friendly_model_name = "Random Forest Classifier"
        elif "DecisionTree" in model_name:
            friendly_model_name = "Decision Tree Classifier"
        else:
            friendly_model_name = "Logistic Regression"
            
        return {
            "risk_level": risk_level,
            "risk_score": final_risk_score,
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 1),
            "probabilities": prob_dict,
            "model_used": friendly_model_name,
            "location": {
                "latitude": float(input_data.get("latitude", 11.0168)),
                "longitude": float(input_data.get("longitude", 76.9558))
            },
            "explanation": explanation_data["narrative"],
            "contributing_factors": explanation_data["factors"],
            "safety_recommendations": explanation_data["recommendations"]
        }
        
    def _generate_explanation(self, data: dict, risk_level: str, risk_score: float, probs: dict) -> dict:
        """Generates dynamic transparent risk factor breakdowns and safety advice."""
        factors = []
        recommendations = []
        
        weather = data.get("weather_condition", "Clear")
        road_cond = data.get("road_condition", "Dry")
        traffic = data.get("traffic_density", "Medium")
        visibility = float(data.get("visibility", 5.0))
        speed_limit = int(data.get("speed_limit", 60))
        vehicle_count = int(data.get("vehicle_count", 80))
        acc_freq = int(data.get("accident_frequency", 5))
        lighting = data.get("lighting_condition", "Daylight")
        
        if weather in ["Rainy", "Stormy", "Foggy"]:
            factors.append(f"Adverse weather condition ({weather}) reducing road grip and situational awareness")
            recommendations.append("Enable fog lights/wipers and increase following distance to at least 4 seconds")
            
        if road_cond in ["Wet", "Damaged", "Icy"]:
            factors.append(f"Compromised road surface condition ({road_cond}) elevating braking distance")
            recommendations.append("Reduce speed by 20-30% below speed limit on slippery/damaged road segments")
            
        if traffic == "High" or vehicle_count > 120:
            factors.append(f"High traffic density with {vehicle_count} active vehicles creating congestion friction")
            recommendations.append("Exercise patience during lane mergers and avoid abrupt lane shifts")
            
        if visibility < 2.0:
            factors.append(f"Critically restricted visibility ({visibility} km) impeding hazard detection")
            recommendations.append("Drive at controlled speeds with low beams; avoid high beam glare")
            
        if speed_limit >= 80:
            factors.append(f"High-speed corridor limit ({speed_limit} km/h) amplifying kinetic collision risk")
            recommendations.append("Strictly obey lane discipline and avoid sudden braking")
            
        if acc_freq >= 8:
            factors.append(f"Frequent historical accident hotspot ({acc_freq} past recorded incidents in zone)")
            recommendations.append("Heightened caution required due to known blind spots / junction layout")
            
        if lighting in ["Night", "Dark - No Streetlights"]:
            factors.append(f"Dim ambient lighting ({lighting}) requiring intensified driver vigilance")
            recommendations.append("Ensure functional headlights and watch for pedestrians or unmarked obstacles")
            
        if not factors:
            factors.append("Nominal road and weather conditions with standard urban/highway traffic flow")
            recommendations.append("Maintain standard safe driving practices and speed limit compliance")
            
        if risk_level == "High":
            narrative = (
                f"The predicted accident risk is HIGH ({risk_score}/100) primarily driven by "
                + ", ".join(factors[:3]) + ". Proactive speed moderation and alert driving are strongly advised."
            )
        elif risk_level == "Medium":
            narrative = (
                f"The predicted accident risk is MEDIUM ({risk_score}/100) due to moderate influence from "
                + ", ".join(factors[:2]) + ". Driver alertness and moderate following distances recommended."
            )
        else:
            narrative = (
                f"The predicted accident risk is LOW ({risk_score}/100). Environmental and road indicators are within "
                "favorable thresholds with stable traffic conditions."
            )
            
        return {
            "narrative": narrative,
            "factors": factors,
            "recommendations": recommendations
        }
