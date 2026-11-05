"""
Analytics & Statistics Service
Calculates aggregations, risk zone statistics, hourly trends,
and correlation metrics for charts and dashboards.
"""

import os
import json
import pandas as pd
from typing import Dict, Any, List
from backend.app.database.db import db_manager

class AnalyticsService:
    def __init__(self):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        self.csv_path = os.path.join(project_root, "data", "raw", "accidents_dataset.csv")
        self.saved_models_dir = os.path.join(project_root, "ml", "saved_models")
        
    def _load_dataframe(self) -> pd.DataFrame:
        if os.path.exists(self.csv_path):
            return pd.read_csv(self.csv_path)
        else:
            accidents = db_manager.get_accidents(limit=10000)
            if accidents:
                return pd.DataFrame(accidents)
            return pd.DataFrame()
            
    def get_dashboard_statistics(self) -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {
                "total_accidents": 0,
                "high_risk_count": 0,
                "medium_risk_count": 0,
                "low_risk_count": 0,
                "avg_risk_score": 0.0,
                "risk_distribution": [],
                "weather_distribution": [],
                "traffic_distribution": [],
                "road_condition_distribution": [],
                "hourly_distribution": [],
                "severity_distribution": [],
                "road_type_distribution": [],
                "lighting_distribution": []
            }
            
        total = len(df)
        risk_counts = df["risk_level"].value_counts().to_dict()
        
        # Risk Distribution
        risk_distribution = [
            {"name": "Low", "value": int(risk_counts.get("Low", 0)), "color": "#10B981"},
            {"name": "Medium", "value": int(risk_counts.get("Medium", 0)), "color": "#F59E0B"},
            {"name": "High", "value": int(risk_counts.get("High", 0)), "color": "#EF4444"}
        ]
        
        # Weather distribution
        weather_counts = df["weather_condition"].value_counts().to_dict()
        weather_distribution = [
            {"name": k, "count": int(v), "avg_risk": round(float(df[df["weather_condition"] == k]["risk_score"].mean()), 1)}
            for k, v in weather_counts.items()
        ]
        
        # Traffic distribution
        traffic_counts = df["traffic_density"].value_counts().to_dict()
        traffic_distribution = [
            {"name": k, "count": int(v), "avg_risk": round(float(df[df["traffic_density"] == k]["risk_score"].mean()), 1)}
            for k, v in traffic_counts.items()
        ]
        
        # Road condition distribution
        road_counts = df["road_condition"].value_counts().to_dict()
        road_distribution = [
            {"name": k, "count": int(v), "avg_risk": round(float(df[df["road_condition"] == k]["risk_score"].mean()), 1)}
            for k, v in road_counts.items()
        ]
        
        # Hourly distribution
        if "time" in df.columns:
            hours = df["time"].apply(lambda t: int(str(t).split(":")[0]) if ":" in str(t) else 12)
            df_temp = df.copy()
            df_temp["hour"] = hours
            hourly_agg = df_temp.groupby("hour").agg(
                count=("accident_id", "count"),
                avg_risk=("risk_score", "mean")
            ).reset_index()
            
            hourly_distribution = [
                {
                    "hour": f"{int(r['hour']):02d}:00",
                    "hour_num": int(r["hour"]),
                    "count": int(r["count"]),
                    "avg_risk": round(float(r["avg_risk"]), 1)
                }
                for _, r in hourly_agg.iterrows()
            ]
            hourly_distribution.sort(key=lambda x: x["hour_num"])
        else:
            hourly_distribution = []
            
        # Severity distribution
        severity_counts = df["accident_severity"].value_counts().to_dict()
        severity_distribution = [
            {"name": k, "count": int(v)} for k, v in severity_counts.items()
        ]
        
        # Road type distribution
        road_type_counts = df["road_type"].value_counts().to_dict()
        road_type_distribution = [
            {"name": k, "count": int(v), "avg_risk": round(float(df[df["road_type"] == k]["risk_score"].mean()), 1)}
            for k, v in road_type_counts.items()
        ]
        
        # Lighting distribution
        lighting_counts = df["lighting_condition"].value_counts().to_dict()
        lighting_distribution = [
            {"name": k, "count": int(v), "avg_risk": round(float(df[df["lighting_condition"] == k]["risk_score"].mean()), 1)}
            for k, v in lighting_counts.items()
        ]
        
        return {
            "total_accidents": total,
            "high_risk_count": int(risk_counts.get("High", 0)),
            "medium_risk_count": int(risk_counts.get("Medium", 0)),
            "low_risk_count": int(risk_counts.get("Low", 0)),
            "avg_risk_score": round(float(df["risk_score"].mean()), 1),
            "high_risk_percentage": round(float(risk_counts.get("High", 0) / total * 100), 1),
            "risk_distribution": risk_distribution,
            "weather_distribution": weather_distribution,
            "traffic_distribution": traffic_distribution,
            "road_condition_distribution": road_distribution,
            "hourly_distribution": hourly_distribution,
            "severity_distribution": severity_distribution,
            "road_type_distribution": road_type_distribution,
            "lighting_distribution": lighting_distribution
        }
        
    def get_risk_zones(self) -> List[Dict[str, Any]]:
        risk_zones_file = os.path.join(self.saved_models_dir, "risk_zones.json")
        if os.path.exists(risk_zones_file):
            with open(risk_zones_file, "r") as f:
                return json.load(f)
        return []
        
    def get_model_performance(self) -> Dict[str, Any]:
        metrics_file = os.path.join(self.saved_models_dir, "all_models_metrics.json")
        summary_file = os.path.join(self.saved_models_dir, "training_summary.json")
        feat_file = os.path.join(self.saved_models_dir, "feature_importance.json")
        
        metrics = {}
        summary = {}
        feat_imp = {}
        
        if os.path.exists(metrics_file):
            with open(metrics_file, "r") as f:
                metrics = json.load(f)
        if os.path.exists(summary_file):
            with open(summary_file, "r") as f:
                summary = json.load(f)
        if os.path.exists(feat_file):
            with open(feat_file, "r") as f:
                feat_imp = json.load(f)
                
        return {
            "best_model_name": summary.get("best_model_name"),
            "best_model_accuracy": summary.get("best_model_accuracy"),
            "best_model_f1": summary.get("best_model_f1"),
            "total_training_samples": summary.get("total_training_samples"),
            "total_test_samples": summary.get("total_test_samples"),
            "trained_at": summary.get("trained_at", ""),
            "models": metrics,
            "feature_importance": feat_imp
        }

analytics_service = AnalyticsService()
