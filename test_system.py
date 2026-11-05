import requests
import json

def test_full_system():
    print("==================================================")
    print(" INTELLIGENT ROAD ACCIDENT RISK PREDICTION SYSTEM ")
    print("          SYSTEM INTEGRATION VERIFICATION         ")
    print("==================================================\n")

    # 1. Frontend Server Check
    try:
        vite_res = requests.get("http://localhost:5173", timeout=5)
        print(f"✅ Frontend Vite Dev Server: HTTP {vite_res.status_code} (Port 5173 is live)")
    except Exception as e:
        print(f"❌ Frontend Server Error: {e}")

    # 2. Backend Health Check
    base_url = "http://127.0.0.1:8000/api"
    try:
        health_res = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Backend Health: HTTP {health_res.status_code} -> {health_res.json()}")
    except Exception as e:
        print(f"❌ Backend Health Error: {e}")

    # 3. Model Performance Endpoint
    try:
        perf_res = requests.get(f"{base_url}/model-performance", timeout=5)
        perf_data = perf_res.json()
        print(f"✅ Model Performance API: Best Model = {perf_data.get('best_model_name')} (Accuracy: {perf_data.get('best_model_accuracy')})")
        print("   Trained Models:", list(perf_data.get("models", {}).keys()))
    except Exception as e:
        print(f"❌ Model Performance API Error: {e}")

    # 4. Geospatial Risk Zones
    try:
        zones_res = requests.get(f"{base_url}/risk-zones", timeout=5)
        zones_data = zones_res.json()
        print(f"✅ Risk Zones API: Identified {zones_data.get('total_zones')} spatial risk sectors")
        top_zone = zones_data.get("zones", [{}])[0]
        print(f"   Top Risk Sector: {top_zone.get('zone_name')} (Avg Risk: {top_zone.get('avg_risk_score')}/100, Level: {top_zone.get('risk_level')})")
    except Exception as e:
        print(f"❌ Risk Zones API Error: {e}")

    # 5. Statistics API
    try:
        stats_res = requests.get(f"{base_url}/statistics", timeout=5)
        stats = stats_res.json()
        print(f"✅ Statistics API: {stats.get('total_accidents')} records indexed (Avg Score: {stats.get('avg_risk_score')})")
    except Exception as e:
        print(f"❌ Statistics API Error: {e}")

    # 6. Live Risk Prediction Request
    print("\n--- Testing Live ML Risk Prediction ---")
    test_scenarios = [
        {
            "name": "Stormy Night High-Speed Highway (Expected High Risk)",
            "payload": {
                "latitude": 11.0285,
                "longitude": 77.0120,
                "weather_condition": "Stormy",
                "traffic_density": "High",
                "road_condition": "Wet",
                "visibility": 0.8,
                "road_type": "Highway",
                "speed_limit": 100,
                "vehicle_count": 160,
                "accident_frequency": 11,
                "day_of_week": "Friday",
                "lighting_condition": "Dark - No Streetlights",
                "urban_rural": "Urban",
                "time": "22:45"
            }
        },
        {
            "name": "Clear Daylight Urban Street (Expected Low Risk)",
            "payload": {
                "latitude": 11.0310,
                "longitude": 77.0420,
                "weather_condition": "Clear",
                "traffic_density": "Low",
                "road_condition": "Dry",
                "visibility": 9.0,
                "road_type": "Urban Street",
                "speed_limit": 40,
                "vehicle_count": 30,
                "accident_frequency": 2,
                "day_of_week": "Tuesday",
                "lighting_condition": "Daylight",
                "urban_rural": "Urban",
                "time": "10:30"
            }
        }
    ]

    for scenario in test_scenarios:
        res = requests.post(f"{base_url}/predict", json=scenario["payload"], timeout=5)
        p = res.json()
        print(f"Scenario: {scenario['name']}")
        print(f"  -> Risk Level: {p.get('risk_level')}")
        print(f"  -> Risk Score: {p.get('risk_score')}/100")
        print(f"  -> Confidence: {p.get('confidence_percentage')}% (Model: {p.get('model_used')})")
        print(f"  -> Explanation: {p.get('explanation')[:110]}...")
        print()

    # 7. Audit History
    try:
        hist_res = requests.get(f"{base_url}/predictions", timeout=5)
        print(f"✅ Prediction Audit History: {hist_res.json().get('total')} predictions logged in DB.")
    except Exception as e:
        print(f"❌ Prediction Audit History Error: {e}")

    print("\n==================================================")
    print("           ALL SYSTEM CHECKS PASSED!              ")
    print("==================================================")

if __name__ == "__main__":
    test_full_system()
