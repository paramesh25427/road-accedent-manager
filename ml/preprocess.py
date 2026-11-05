"""
Data Preprocessing & Feature Engineering Module
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

LABEL_MAPPING = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}
INVERSE_LABEL_MAPPING = {v: k for k, v in LABEL_MAPPING.items()}

NUMERICAL_COLS = [
    "latitude",
    "longitude",
    "visibility",
    "speed_limit",
    "vehicle_count",
    "accident_frequency",
    "hour",
    "is_rush_hour",
    "is_night",
    "is_weekend"
]

CATEGORICAL_COLS = [
    "weather_condition",
    "traffic_density",
    "road_condition",
    "road_type",
    "urban_rural",
    "lighting_condition",
    "day_of_week"
]

class FeatureEngineeringTransformer(BaseEstimator, TransformerMixin):
    """Custom transformer to engineer time and environmental features from raw inputs."""
    
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        df = X.copy()
        if isinstance(df, dict):
            df = pd.DataFrame([df])
        elif isinstance(df, list):
            df = pd.DataFrame(df)
            
        # Extract time features if time or date string is present
        if "time" in df.columns:
            def parse_hour(val):
                try:
                    if isinstance(val, str) and ":" in val:
                        return int(val.split(":")[0])
                    return int(val)
                except Exception:
                    return 12
            df["hour"] = df["time"].apply(parse_hour)
        elif "hour" not in df.columns:
            df["hour"] = 12
            
        # Rush hour (8-11, 17-21)
        df["is_rush_hour"] = df["hour"].apply(lambda h: 1 if (8 <= h <= 11) or (17 <= h <= 21) else 0)
        
        # Night indicator (20-05)
        df["is_night"] = df["hour"].apply(lambda h: 1 if (h >= 20 or h <= 5) else 0)
        
        # Weekend indicator
        if "day_of_week" in df.columns:
            df["is_weekend"] = df["day_of_week"].apply(lambda d: 1 if str(d).strip().capitalize() in ["Saturday", "Sunday"] else 0)
        elif "date" in df.columns:
            df["is_weekend"] = pd.to_datetime(df["date"], errors="coerce").dt.dayofweek.apply(lambda dw: 1 if dw >= 5 else 0)
        else:
            df["is_weekend"] = 0
            
        # Fill missing values with robust defaults
        defaults = {
            "latitude": 11.0168,
            "longitude": 76.9558,
            "visibility": 5.0,
            "speed_limit": 60,
            "vehicle_count": 80,
            "accident_frequency": 5,
            "weather_condition": "Clear",
            "traffic_density": "Medium",
            "road_condition": "Dry",
            "road_type": "Highway",
            "urban_rural": "Urban",
            "lighting_condition": "Daylight",
            "day_of_week": "Monday"
        }
        for col, default_val in defaults.items():
            if col not in df.columns:
                df[col] = default_val
            else:
                df[col] = df[col].fillna(default_val)
                
        return df

def build_preprocessor_pipeline():
    """Builds and returns the full Scikit-Learn ColumnTransformer pipeline."""
    numeric_transformer = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    column_processor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_COLS),
            ("cat", categorical_transformer, CATEGORICAL_COLS)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ("feature_engineer", FeatureEngineeringTransformer()),
        ("column_processor", column_processor)
    ])
    
    return pipeline

def get_feature_names(fitted_pipeline):
    """Extracts output feature names after ColumnTransformer one-hot encoding."""
    col_processor = fitted_pipeline.named_steps["column_processor"]
    cat_encoder = col_processor.named_transformers_["cat"].named_steps["onehot"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_COLS))
    return NUMERICAL_COLS + cat_feature_names
