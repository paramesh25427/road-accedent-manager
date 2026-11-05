# Intelligent Road Accident Risk Prediction System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-1.7+-EB4034.svg?style=flat)](https://xgboost.readthedocs.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900.svg?style=flat&logo=Leaflet&logoColor=white)](https://leafletjs.com/)

> **A full-stack demo for exploring generated road-condition records, comparing classification models, and estimating risk for user-entered scenarios.**

---

## 1. Project Overview

The **Intelligent Road Accident Risk Prediction System** combines machine-learning classifiers, grid-based spatial summaries, and an interactive web interface. It is an analyst-oriented demonstration, not a live accident-monitoring or alerting service.

**Data limitation:** The included 6,000 records are synthetically generated around Coimbatore. They are not verified real accident reports. The model's evaluation measures how well it predicts labels produced by this demo's own scoring rules; it does not establish real-world predictive accuracy. There is no live traffic, weather, or crash-data feed.

The classifier returns **Low**, **Medium**, or **High** for an entered scenario. The UI also displays a 0–100 application score derived from the model's class probabilities and additional rule-based adjustments. The score is not a calibrated crash probability, and its numeric value is not the rule used to select the returned class.

---

## 2. Key Features

- 🎯 **Scenario-Based Risk Predictor**:
  - Interactive Leaflet coordinate picker with reverse-mapping.
  - Multi-attribute parameter adjustments (Weather, Visibility slider, Lighting condition, Road type, Speed limit, Traffic density, Vehicle volume, Historical incidents).
  - **0–100 application score**, class probability distribution, and rule-generated explanation for the entered scenario (no live feeds).
- 🗺️ **Interactive Geospatial Heatmap & Risk Corridors**:
  - OpenStreetMap tiles with customizable circle marker layers.
  - Clustered spatial danger zones with dynamic radius and incident concentration metrics.
  - Client-side layer toggles and filtering of sample incident points.
- 📊 **Dynamic Analytical Dashboard**:
  - Charts and filters for the generated sample records; filters narrow the records table and CSV export, while summary charts use the full sample.
- 🤖 **Empirical 4-Model ML Benchmarking**:
  - Trains and compares **Logistic Regression**, **Decision Tree**, **Random Forest**, and **XGBoost**.
  - Evaluates Accuracy, Precision, Recall, Weighted F1, and Macro F1 on a held-out split of generated data.
  - Interactive **Confusion Matrix** visualizer with match/error cell highlights.
  - Ranked **Feature Importance** breakdown.
  - On-demand background retraining triggered via REST API.
- 🗄️ **Robust Dual Database Support**:
  - Primary **MongoDB** persistence for accident records and prediction history.
  - Automatic **Zero-Config SQLite Fallback** ensuring immediate execution even if MongoDB is not locally running.
- 📜 **Prediction Audit Log**:
  - Persistent record of historical inferences with full input snapshot and detail modals.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4, Custom Glassmorphism tokens, Lucide React Icons
- **Mapping**: Leaflet + React-Leaflet + OpenStreetMap
- **Charting**: Recharts
- **HTTP Client**: Axios

### Backend & Machine Learning
- **Framework**: Python 3.11 + FastAPI + Uvicorn
- **ML & Data Science**: Scikit-Learn, XGBoost, Pandas, NumPy, Joblib
- **Validation**: Pydantic v2
- **Database**: MongoDB (Motor / PyMongo) with automated SQLite local storage fallback

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React 19 Frontend UI                     │
│  (Dashboard, Risk Predictor, Heatmap, Analytics, ML Eval)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend (Port 8000)              │
│  - /api/predict          - /api/statistics                  │
│  - /api/accidents        - /api/model-performance           │
│  - /api/risk-zones       - /api/predictions                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│   ML Pipeline & Artifacts   ││      Database Storage        │
│ - StandardScaler & Encoders ││ - MongoDB (Primary)          │
│ - Random Forest / XGBoost   ││ - SQLite Store (Fallback)    │
│ - Geospatial Risk Clusters  ││ - Historical & Audit Records │
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 5. Machine Learning Pipeline & Risk Score Meaning

### Preprocessing & Feature Engineering
1. **Temporal Extraction**: Parses hour, minute, flags rush hours (`08:00-11:00`, `17:00-21:00`), night hours (`20:00-05:00`), and weekend indicators.
2. **Standardized Scaling**: Transforms numerical continuous features (`visibility`, `speed_limit`, `vehicle_count`, `accident_frequency`, `hour`, `latitude`, `longitude`).
3. **Categorical One-Hot Encoding**: Encodes `weather_condition`, `traffic_density`, `road_condition`, `road_type`, `urban_rural`, and `lighting_condition`.

### Generated training labels
The sample generator computes a synthetic score from weather, road surface, visibility, traffic, speed limit, vehicle count, lighting, accident frequency, road type, and Gaussian noise. It clamps that score to 0–100, then labels it **Low** below 38, **Medium** below 68, and **High** otherwise. This score is used to create training labels; it is not evidence from observed crash outcomes.

### Prediction display score
At inference time the saved classifier predicts a class and class-probability distribution. The displayed score is computed as `P(Low) × 18 + P(Medium) × 55 + P(High) × 90`, followed by fixed adjustments for selected road/weather/traffic inputs and clamping to 5–99. The risk class is the classifier's prediction and is distinct from thresholding this display score.

---

## 6. Model Benchmark Comparison

The training module automatically fits and benchmarks all 4 models:

| Classification Architecture | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) | Key Characteristics |
|---|:---:|:---:|:---:|:---:|---|
| **Logistic Regression** | 93.25% | 93.34% | 93.25% | 93.22% | Linear baseline model; selected in the current saved run |
| **Decision Tree** | 86.75% | 86.83% | 86.75% | 86.78% | Non-linear decision rules |
| **Random Forest** | 89.58% | 90.09% | 89.58% | 89.40% | Tree ensemble |
| **XGBoost Classifier** | 92.25% | 92.47% | 92.25% | 92.18% | Gradient-boosted decision trees |

These are metrics from the saved 80/20 split of the generated dataset. The training code selects the best model by **weighted F1 score**; the results are not a benchmark against independently collected real-world incidents.

---

## 7. Project Directory Structure

```text
road-accident-risk-prediction/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   └── db.py              # MongoDB + SQLite fallback manager
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request & response schemas
│   │   ├── routes/
│   │   │   └── api.py             # REST API endpoints
│   │   ├── services/
│   │   │   ├── analytics_service.py # Aggregations & chart data
│   │   │   └── prediction_service.py # Inference & DB persistence
│   │   └── main.py                # FastAPI initialization & CORS
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── ml/
│   ├── preprocess.py              # Feature engineering & scaling
│   ├── evaluate.py                # Accuracy, F1, Confusion Matrix, Feature Importance
│   ├── model_selection.py         # 4-Model trainer & comparator
│   ├── predict.py                 # Predictor engine & narrative generator
│   ├── train.py                   # Master ML training script
│   └── saved_models/              # Serialized model & metrics JSONs
│
├── data/
│   ├── generate_dataset.py        # Realistic 6,000-sample dataset generator
│   └── raw/
│       ├── accidents_dataset.csv
│       └── dataset_metadata.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── RiskScoreGauge.jsx
│   │   │   └── PredictionResultCard.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PredictRiskPage.jsx
│   │   │   ├── AccidentMapPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ModelPerformancePage.jsx
│   │   │   ├── PredictionHistoryPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── notebooks/
│   └── exploratory_analysis.ipynb
└── README.md
```

---

## 8. Installation & Quick Start Guide

### Prerequisites
- **Python**: 3.10 or 3.11+
- **Node.js**: v18+ (Node 20+ recommended)
- **MongoDB**: Optional (If MongoDB is offline, SQLite automatic mode is used seamlessly)

### Step 1: Install Backend Dependencies
```bash
# From project root
pip install -r backend/requirements.txt
```

### Step 2: Train ML Models & Generate Dataset
```bash
python ml/train.py
```
*This script will generate the 6,000-record dataset in `data/raw/`, train all 4 models, evaluate metrics, compute risk clusters, and serialize artifacts to `ml/saved_models/`.*

### Step 3: Start FastAPI Backend Server
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Interactive Swagger API Docs: `http://localhost:8000/docs`

### Step 4: Install Frontend & Start Vite Dev Server
```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
Frontend UI will be live at: `http://localhost:5173`

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and database status |
| `POST` | `/api/predict` | Predicts accident risk level and 0–100 score |
| `GET` | `/api/predictions` | Retrieves previous prediction audit records |
| `DELETE` | `/api/predictions` | Clears stored prediction history |
| `GET` | `/api/accidents` | Retrieves historical accident records with filters |
| `GET` | `/api/statistics` | Dynamic statistical aggregations for dashboard charts |
| `GET` | `/api/risk-zones` | Clustered geospatial danger zones with coordinates |
| `GET` | `/api/model-performance` | Comparative metrics (Accuracy, F1, Confusion Matrices) |
| `GET` | `/api/feature-importance` | Feature importance weight rankings |
| `POST` | `/api/train` | Triggers background ML model retraining |

---

## 10. License & Attribution

Developed for academic demonstration, portfolio showcase, and intelligent transportation research. Built with modern full-stack standards and verified machine learning pipelines.
