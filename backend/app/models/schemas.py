"""
Pydantic Schemas for Request & Response Validation
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PredictionInput(BaseModel):
    latitude: float = Field(default=11.0168, ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(default=76.9558, ge=-180.0, le=180.0, description="Longitude coordinate")
    weather_condition: str = Field(default="Clear", description="Clear, Cloudy, Rainy, Foggy, Stormy")
    traffic_density: str = Field(default="Medium", description="Low, Medium, High")
    road_condition: str = Field(default="Dry", description="Dry, Wet, Damaged, Icy")
    visibility: float = Field(default=5.0, ge=0.0, le=20.0, description="Visibility in km")
    road_type: str = Field(default="Highway", description="Highway, Arterial, Urban Street, Rural Road, Expressway")
    speed_limit: int = Field(default=60, ge=20, le=150, description="Speed limit in km/h")
    vehicle_count: int = Field(default=80, ge=0, le=500, description="Estimated vehicle count in sector")
    accident_frequency: int = Field(default=5, ge=0, le=50, description="Historical accidents in area")
    day_of_week: str = Field(default="Monday", description="Day of the week")
    lighting_condition: str = Field(default="Daylight", description="Daylight, Dusk, Dawn, Night, Dark - No Streetlights")
    urban_rural: str = Field(default="Urban", description="Urban or Rural")
    date: Optional[str] = Field(default=None, description="Date in YYYY-MM-DD format")
    time: Optional[str] = Field(default="14:30", description="Time in HH:MM format")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 11.0168,
                "longitude": 76.9558,
                "weather_condition": "Rainy",
                "traffic_density": "High",
                "road_condition": "Wet",
                "visibility": 2.5,
                "road_type": "Highway",
                "speed_limit": 80,
                "vehicle_count": 120,
                "accident_frequency": 8,
                "day_of_week": "Monday",
                "lighting_condition": "Night",
                "urban_rural": "Urban",
                "time": "20:30"
            }
        }

class LocationCoord(BaseModel):
    latitude: float
    longitude: float

class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    id: Optional[str] = None
    timestamp: str
    risk_level: str
    risk_score: float
    confidence: float
    confidence_percentage: float
    probabilities: Dict[str, float]
    model_used: str
    location: LocationCoord
    input_features: Dict[str, Any]
    explanation: str
    contributing_factors: List[str]
    safety_recommendations: List[str]

class AccidentRecord(BaseModel):
    accident_id: str
    latitude: float
    longitude: float
    date: str
    time: str
    weather_condition: str
    traffic_density: str
    road_condition: str
    visibility: float
    road_type: str
    speed_limit: int
    vehicle_count: int
    accident_frequency: int
    accident_severity: str
    day_of_week: str
    urban_rural: str
    lighting_condition: str
    risk_score: float
    risk_level: str

class RiskZone(BaseModel):
    zone_id: str
    zone_name: str
    center_lat: float
    center_lon: float
    radius_meters: int
    total_accidents: int
    avg_risk_score: float
    risk_level: str
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    predominant_weather: str
    predominant_road: str

class ModelMetricDetail(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    macro_f1: float
    confusion_matrix: List[List[int]]

class ModelPerformanceResponse(BaseModel):
    best_model_name: str
    best_model_f1: float
    best_model_accuracy: float
    models: Dict[str, ModelMetricDetail]
    feature_importance: Dict[str, List[Dict[str, Any]]]
    trained_at: Optional[str] = None
    total_records: int
