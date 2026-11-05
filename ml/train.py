"""
End-to-End ML Training & Orchestration Script
Loads dataset, fits preprocessing pipeline, trains 4 models, evaluates metrics,
computes confusion matrices, extracts feature importance, identifies spatial risk zones,
and saves all production model artifacts.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data.generate_dataset import save_dataset
from ml.preprocess import (
    build_preprocessor_pipeline,
    get_feature_names,
    LABEL_MAPPING
)
from ml.model_selection import train_and_compare_all_models

def calculate_geospatial_risk_zones(df, grid_size=0.03):
    """
    Computes spatial risk zones by clustering geographical points into grid cells
    and aggregating total accidents, average risk score, and high-risk ratio.
    """
    zones = []
    
    # Calculate grid bounds
    df["lat_bin"] = (df["latitude"] / grid_size).round() * grid_size
    df["lon_bin"] = (df["longitude"] / grid_size).round() * grid_size
    
    grouped = df.groupby(["lat_bin", "lon_bin"])
    zone_id = 1
    
    zone_names = [
        "Gandhipuram Central Hub", "Avinashi Expressway Sector", "Trichy Road Sector",
        "Mettupalayam Corridor", "Saravanampatti Tech Zone", "Ukkadam Lake Zone",
        "Singanallur Commercial Junction", "Neelambur Bypass", "Peelamedu Airport Sector",
        "Kovaipudur Ring Corridor", "Thondamuthur Rural Ring", "Perur West Roadway"
    ]
    
    for (lat_c, lon_c), group in grouped:
        count = len(group)
        if count < 15:
            continue
            
        avg_score = float(group["risk_score"].mean())
        high_risk_count = int((group["risk_level"] == "High").sum())
        med_risk_count = int((group["risk_level"] == "Medium").sum())
        low_risk_count = int((group["risk_level"] == "Low").sum())
        
        if avg_score >= 65 or (high_risk_count / count) > 0.35:
            zone_risk = "High"
        elif avg_score >= 40:
            zone_risk = "Medium"
        else:
            zone_risk = "Low"
            
        name = zone_names[(zone_id - 1) % len(zone_names)] if zone_id <= len(zone_names) else f"Risk Sector #{zone_id}"
        
        zones.append({
            "zone_id": f"ZONE-{zone_id:03d}",
            "zone_name": name,
            "center_lat": round(float(lat_c), 5),
            "center_lon": round(float(lon_c), 5),
            "radius_meters": int(800 + count * 2),
            "total_accidents": count,
            "avg_risk_score": round(avg_score, 1),
            "risk_level": zone_risk,
            "high_risk_count": high_risk_count,
            "medium_risk_count": med_risk_count,
            "low_risk_count": low_risk_count,
            "predominant_weather": group["weather_condition"].mode()[0] if not group["weather_condition"].empty else "Clear",
            "predominant_road": group["road_condition"].mode()[0] if not group["road_condition"].empty else "Dry"
        })
        zone_id += 1
        
    return sorted(zones, key=lambda z: z["avg_risk_score"], reverse=True)

def run_training_pipeline():
    print("\n=======================================================")
    print("  INTELLIGENT ROAD ACCIDENT RISK PREDICTION ML PIPELINE")
    print("=======================================================\n")
    
    # 1. Dataset loading / generation
    raw_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "accidents_dataset.csv")
    if not os.path.exists(raw_data_path):
        print("Dataset not found. Generating fresh historical accident dataset...")
        df = save_dataset()
    else:
        print(f"Loading existing historical dataset from {raw_data_path}...")
        df = pd.read_csv(raw_data_path)
        
    print(f"Total Dataset Records: {len(df):,}")
    print(f"Features: {list(df.columns)}")
    
    # 2. Target mapping
    y = df["risk_level"].map(LABEL_MAPPING)
    X = df.drop(columns=["risk_level", "risk_score", "accident_id", "accident_severity"], errors="ignore")
    
    # 3. Train-test split (80-20 stratified)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training set: {len(X_train_raw):,} samples | Test set: {len(X_test_raw):,} samples")
    
    # 4. Build and fit preprocessor
    print("Fitting preprocessing & feature engineering pipeline...")
    preprocessor = build_preprocessor_pipeline()
    X_train_processed = preprocessor.fit_transform(X_train_raw)
    X_test_processed = preprocessor.transform(X_test_raw)
    
    feature_names = get_feature_names(preprocessor)
    print(f"Engineered feature vector size: {X_train_processed.shape[1]} features")
    
    # 5. Train and compare 4 models
    results = train_and_compare_all_models(
        X_train_processed, y_train, X_test_processed, y_test, feature_names
    )
    
    best_model_name = results["best_model_name"]
    best_model = results["best_model"]
    all_metrics = results["all_metrics"]
    all_feature_importances = results["all_feature_importances"]
    
    # 6. Calculate risk zones
    print("Aggregating geographical risk zones...")
    risk_zones = calculate_geospatial_risk_zones(df)
    print(f"Identified {len(risk_zones)} geographical risk zones.")
    
    # 7. Save all artifacts
    save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(save_dir, exist_ok=True)
    
    joblib.dump(best_model, os.path.join(save_dir, "best_model.joblib"))
    joblib.dump(preprocessor, os.path.join(save_dir, "preprocessor.joblib"))
    
    # Save comparison metrics JSON
    with open(os.path.join(save_dir, "all_models_metrics.json"), "w") as f:
        json.dump(all_metrics, f, indent=2)
        
    with open(os.path.join(save_dir, "feature_importance.json"), "w") as f:
        json.dump(all_feature_importances, f, indent=2)
        
    with open(os.path.join(save_dir, "risk_zones.json"), "w") as f:
        json.dump(risk_zones, f, indent=2)
        
    # Summary JSON
    summary = {
        "best_model_name": best_model_name,
        "best_model_accuracy": all_metrics[best_model_name]["accuracy"],
        "best_model_f1": all_metrics[best_model_name]["f1_score"],
        "total_training_samples": len(X_train_raw),
        "total_test_samples": len(X_test_raw),
        "models_trained": list(all_metrics.keys()),
        "classes": ["Low", "Medium", "High"],
        "trained_at": pd.Timestamp.now().isoformat()
    }
    with open(os.path.join(save_dir, "training_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)
        
    print("\nSaved artifacts to ml/saved_models/:")
    print(" - best_model.joblib")
    print(" - preprocessor.joblib")
    print(" - all_models_metrics.json")
    print(" - feature_importance.json")
    print(" - risk_zones.json")
    print(" - training_summary.json")
    print("\nML Pipeline successfully completed!\n")

if __name__ == "__main__":
    run_training_pipeline()
