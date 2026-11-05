"""
Dataset Generation Script for Intelligent Road Accident Risk Prediction System.
Generates realistic historical accident records with realistic geospatial distributions,
environmental conditions, and documented multi-factor risk scoring.
"""

import os
import json
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_accident_dataset(num_records=6000, seed=42):
    random.seed(seed)
    np.random.seed(seed)
    
    # Core hotspot centers (realistic coordinates centered around Coimbatore & major corridors)
    # 11.0168 N, 76.9558 E
    hotspots = [
        {"name": "Avinashi Road Junction", "lat": 11.0285, "lon": 77.0120, "base_risk": "High", "freq": 10},
        {"name": "Gandhipuram Bus Stand Area", "lat": 11.0176, "lon": 76.9674, "base_risk": "High", "freq": 12},
        {"name": "Trichy Road Flyover", "lat": 10.9982, "lon": 76.9825, "base_risk": "Medium", "freq": 8},
        {"name": "Mettupalayam Highway (NH-181)", "lat": 11.0850, "lon": 76.9450, "base_risk": "High", "freq": 11},
        {"name": "Pollachi Road Expressway", "lat": 10.9250, "lon": 77.0150, "base_risk": "Medium", "freq": 7},
        {"name": "Saravanampatti Tech Corridor", "lat": 11.0805, "lon": 77.0012, "base_risk": "Medium", "freq": 6},
        {"name": "Ukkadam Lake Bypass", "lat": 10.9850, "lon": 76.9550, "base_risk": "High", "freq": 9},
        {"name": "Peelamedu Airport Road", "lat": 11.0310, "lon": 77.0420, "base_risk": "Low", "freq": 4},
        {"name": "Thondamuthur Rural Corridor", "lat": 10.9950, "lon": 76.8500, "base_risk": "Low", "freq": 3},
        {"name": "Singanallur Junction", "lat": 11.0020, "lon": 77.0250, "base_risk": "High", "freq": 10},
        {"name": "Kovaipudur Ring Road", "lat": 10.9400, "lon": 76.9300, "base_risk": "Low", "freq": 3},
        {"name": "Neelambur Bypass Intersection", "lat": 11.0550, "lon": 77.0850, "base_risk": "High", "freq": 13}
    ]
    
    weather_options = ["Clear", "Cloudy", "Rainy", "Foggy", "Stormy"]
    weather_weights = [0.45, 0.25, 0.18, 0.08, 0.04]
    
    traffic_options = ["Low", "Medium", "High"]
    traffic_weights = [0.30, 0.45, 0.25]
    
    road_condition_options = ["Dry", "Wet", "Damaged", "Icy"]
    road_weights = [0.60, 0.25, 0.12, 0.03]
    
    road_types = ["Highway", "Arterial", "Urban Street", "Rural Road", "Expressway"]
    road_type_weights = [0.35, 0.25, 0.20, 0.10, 0.10]
    
    lighting_options = ["Daylight", "Dusk", "Dawn", "Night", "Dark - No Streetlights"]
    lighting_weights = [0.50, 0.10, 0.08, 0.22, 0.10]
    
    severity_options = ["Minor", "Moderate", "Severe", "Fatal"]
    severity_weights = [0.40, 0.35, 0.20, 0.05]
    
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    start_date = datetime(2023, 1, 1)
    
    records = []
    
    for i in range(1, num_records + 1):
        accident_id = f"ACC-2024-{i:05d}"
        
        # Select hotspot or surrounding region with scatter
        hotspot = random.choice(hotspots)
        lat_scatter = np.random.normal(0, 0.015)
        lon_scatter = np.random.normal(0, 0.015)
        lat = round(hotspot["lat"] + lat_scatter, 6)
        lon = round(hotspot["lon"] + lon_scatter, 6)
        
        # Date & Time
        random_days = random.randint(0, 730)
        rec_date = start_date + timedelta(days=random_days)
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        time_str = f"{hour:02d}:{minute:02d}"
        day_of_week = rec_date.strftime("%A")
        
        # Environmental and Road Features
        weather = random.choices(weather_options, weights=weather_weights)[0]
        
        # If rainy or stormy, road condition is likely wet
        if weather in ["Rainy", "Stormy"] and random.random() < 0.85:
            road_cond = "Wet"
        else:
            road_cond = random.choices(road_condition_options, weights=road_weights)[0]
            
        # Visibility correlates with weather and lighting
        if weather == "Foggy":
            visibility = round(random.uniform(0.2, 1.5), 1)
        elif weather == "Stormy":
            visibility = round(random.uniform(0.5, 2.5), 1)
        elif weather == "Rainy":
            visibility = round(random.uniform(1.0, 4.0), 1)
        elif weather == "Cloudy":
            visibility = round(random.uniform(4.0, 8.0), 1)
        else:
            visibility = round(random.uniform(7.0, 10.0), 1)
            
        # Lighting correlates with hour
        if 6 <= hour <= 17:
            lighting = "Daylight"
        elif hour in [18, 19]:
            lighting = "Dusk"
        elif hour in [5]:
            lighting = "Dawn"
        else:
            lighting = random.choice(["Night", "Dark - No Streetlights"])
            
        # Traffic density correlates with rush hours (8-11 AM, 5-9 PM)
        is_rush = (8 <= hour <= 11) or (17 <= hour <= 21)
        if is_rush:
            traffic = random.choices(["Medium", "High"], weights=[0.35, 0.65])[0]
            vehicle_count = random.randint(110, 240)
        else:
            traffic = random.choices(traffic_options, weights=traffic_weights)[0]
            if traffic == "High":
                vehicle_count = random.randint(100, 180)
            elif traffic == "Medium":
                vehicle_count = random.randint(50, 110)
            else:
                vehicle_count = random.randint(10, 60)
                
        road_type = random.choices(road_types, weights=road_type_weights)[0]
        
        if road_type == "Expressway":
            speed_limit = random.choice([100, 120])
            urban_rural = "Rural" if random.random() < 0.6 else "Urban"
        elif road_type == "Highway":
            speed_limit = random.choice([80, 100])
            urban_rural = "Rural" if random.random() < 0.4 else "Urban"
        elif road_type == "Arterial":
            speed_limit = random.choice([50, 60, 70])
            urban_rural = "Urban"
        elif road_type == "Urban Street":
            speed_limit = random.choice([30, 40, 50])
            urban_rural = "Urban"
        else:
            speed_limit = random.choice([40, 50, 60])
            urban_rural = "Rural"
            
        # Accident frequency based on hotspot base frequency + local variation
        accident_freq = max(1, min(15, int(round(np.random.normal(hotspot["freq"], 1.8)))))
        
        # Base accident severity
        severity = random.choices(severity_options, weights=severity_weights)[0]
        
        # --- DOCUMENTED MULTI-FACTOR RISK SCORE FORMULA (0 - 100) ---
        score = 8.0  # base
        
        # Weather influence
        weather_scores = {"Clear": 0, "Cloudy": 4, "Rainy": 14, "Foggy": 20, "Stormy": 25}
        score += weather_scores.get(weather, 0)
        
        # Road condition influence
        road_scores = {"Dry": 0, "Wet": 12, "Damaged": 18, "Icy": 25}
        score += road_scores.get(road_cond, 0)
        
        # Visibility factor
        if visibility < 1.0:
            score += 18
        elif visibility < 2.5:
            score += 12
        elif visibility < 5.0:
            score += 6
            
        # Traffic density factor
        traffic_scores = {"Low": 0, "Medium": 8, "High": 16}
        score += traffic_scores.get(traffic, 0)
        
        # Speed limit factor
        if speed_limit >= 100:
            score += 12
        elif speed_limit >= 80:
            score += 7
        elif speed_limit >= 60:
            score += 3
            
        # Vehicle count factor
        if vehicle_count > 150:
            score += 8
        elif vehicle_count > 90:
            score += 4
            
        # Lighting condition factor
        lighting_scores = {
            "Daylight": 0,
            "Dawn": 4,
            "Dusk": 5,
            "Night": 10,
            "Dark - No Streetlights": 18
        }
        score += lighting_scores.get(lighting, 0)
        
        # Historical frequency factor
        score += accident_freq * 1.5
        
        # Road type factor
        if road_type in ["Expressway", "Highway"]:
            score += 6
            
        # Add slight natural randomness (Gaussian std=2.5)
        score += np.random.normal(0, 2.5)
        
        # Normalize and clamp score to 0 - 100
        risk_score = round(max(0.0, min(100.0, score)), 1)
        
        # Classify risk level
        if risk_score < 38.0:
            risk_level = "Low"
        elif risk_score < 68.0:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        records.append({
            "accident_id": accident_id,
            "latitude": lat,
            "longitude": lon,
            "date": rec_date.strftime("%Y-%m-%d"),
            "time": time_str,
            "weather_condition": weather,
            "traffic_density": traffic,
            "road_condition": road_cond,
            "visibility": visibility,
            "road_type": road_type,
            "speed_limit": speed_limit,
            "vehicle_count": vehicle_count,
            "accident_frequency": accident_freq,
            "accident_severity": severity,
            "day_of_week": day_of_week,
            "urban_rural": urban_rural,
            "lighting_condition": lighting,
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        
    df = pd.DataFrame(records)
    return df

def save_dataset():
    data_dir = os.path.join(os.path.dirname(__file__), "raw")
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "accidents_dataset.csv")
    
    print("Generating realistic synthetic accident dataset (6,000 records)...")
    df = generate_accident_dataset(num_records=6000, seed=42)
    df.to_csv(csv_path, index=False)
    print(f"Dataset successfully saved to: {csv_path}")
    print("\nClass Distribution:")
    print(df["risk_level"].value_counts(normalize=True).round(3) * 100)
    print("\nSummary Statistics:")
    print(df.describe().round(2))
    
    # Save a metadata file explaining the dataset
    meta = {
        "dataset_name": "Intelligent Road Accident Risk Historical Dataset (Synthetic / Demo Benchmark)",
        "total_records": len(df),
        "columns": list(df.columns),
        "target_variable": "risk_level",
        "classes": ["Low", "Medium", "High"],
        "class_counts": df["risk_level"].value_counts().to_dict(),
        "geographic_center": {"lat": 11.0168, "lon": 76.9558},
        "description": "Realistic accident records generated with multi-factor risk logic for training, evaluation, and geospatial clustering."
    }
    with open(os.path.join(data_dir, "dataset_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
        
    return df

if __name__ == "__main__":
    save_dataset()
