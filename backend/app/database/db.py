"""
Database Integration Layer
Supports MongoDB with automatic graceful fallback to SQLite/Local JSON store
for maximum portability and zero-configuration startup.
"""

import os
import json
import sqlite3
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "road_accident_db")

class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.mongo_db = None
        self.sqlite_db_path = os.path.join(os.path.dirname(__file__), "..", "..", "data_store.db")
        self._init_database()
        
    def _init_database(self):
        # Attempt MongoDB connection
        try:
            from pymongo import MongoClient
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
            client.server_info()  # Will throw exception if connection fails
            self.mongo_client = client
            self.mongo_db = client[DATABASE_NAME]
            self.use_mongo = True
            print(f"Connected successfully to MongoDB at {MONGODB_URI} [Database: {DATABASE_NAME}]")
        except Exception as e:
            self.use_mongo = False
            print(f"MongoDB not reachable ({e}). Falling back to robust SQLite local datastore: {self.sqlite_db_path}")
            self._init_sqlite()
            
    def _init_sqlite(self):
        conn = sqlite3.connect(self.sqlite_db_path)
        cursor = conn.cursor()
        
        # Predictions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                timestamp TEXT,
                latitude REAL,
                longitude REAL,
                risk_level TEXT,
                risk_score REAL,
                confidence REAL,
                model_used TEXT,
                input_features TEXT,
                explanation TEXT,
                contributing_factors TEXT,
                safety_recommendations TEXT
            )
        """)
        
        # Accidents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS accidents (
                accident_id TEXT PRIMARY KEY,
                latitude REAL,
                longitude REAL,
                date TEXT,
                time TEXT,
                weather_condition TEXT,
                traffic_density TEXT,
                road_condition TEXT,
                visibility REAL,
                road_type TEXT,
                speed_limit INTEGER,
                vehicle_count INTEGER,
                accident_frequency INTEGER,
                accident_severity TEXT,
                day_of_week TEXT,
                urban_rural TEXT,
                lighting_condition TEXT,
                risk_score REAL,
                risk_level TEXT
            )
        """)
        conn.commit()
        conn.close()

    def sync_dataset_if_empty(self, csv_path: str):
        """Loads historical accident dataset into the database if table/collection is empty."""
        if not os.path.exists(csv_path):
            return
            
        df = pd.read_csv(csv_path)
        records = df.to_dict(orient="records")
        
        if self.use_mongo:
            count = self.mongo_db.accidents.count_documents({})
            if count == 0 and records:
                self.mongo_db.accidents.insert_many(records)
                print(f"Inserted {len(records)} accident records into MongoDB collection 'accidents'.")
        else:
            conn = sqlite3.connect(self.sqlite_db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM accidents")
            count = cursor.fetchone()[0]
            if count == 0 and records:
                for r in records:
                    cursor.execute("""
                        INSERT OR REPLACE INTO accidents VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    """, (
                        r["accident_id"], r["latitude"], r["longitude"], r["date"], r["time"],
                        r["weather_condition"], r["traffic_density"], r["road_condition"],
                        r["visibility"], r["road_type"], r["speed_limit"], r["vehicle_count"],
                        r["accident_frequency"], r["accident_severity"], r["day_of_week"],
                        r["urban_rural"], r["lighting_condition"], r["risk_score"], r["risk_level"]
                    ))
                conn.commit()
                print(f"Inserted {len(records)} accident records into SQLite 'accidents' table.")
            conn.close()

    def save_prediction(self, prediction_doc: dict) -> str:
        """Stores a prediction record in DB."""
        pred_id = prediction_doc.get("id") or f"PRED-{int(datetime.now().timestamp() * 1000)}"
        prediction_doc["id"] = pred_id
        
        if self.use_mongo:
            self.mongo_db.predictions.insert_one(prediction_doc)
        else:
            conn = sqlite3.connect(self.sqlite_db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    id, timestamp, latitude, longitude, risk_level, risk_score, confidence,
                    model_used, input_features, explanation, contributing_factors, safety_recommendations
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pred_id,
                prediction_doc.get("timestamp", datetime.now().isoformat()),
                prediction_doc["location"]["latitude"],
                prediction_doc["location"]["longitude"],
                prediction_doc["risk_level"],
                prediction_doc["risk_score"],
                prediction_doc["confidence"],
                prediction_doc["model_used"],
                json.dumps(prediction_doc.get("input_features", {})),
                prediction_doc.get("explanation", ""),
                json.dumps(prediction_doc.get("contributing_factors", [])),
                json.dumps(prediction_doc.get("safety_recommendations", []))
            ))
            conn.commit()
            conn.close()
            
        return pred_id

    def get_predictions(self, limit: int = 100, skip: int = 0) -> List[dict]:
        """Retrieves prediction history sorted by most recent."""
        if self.use_mongo:
            cursor = self.mongo_db.predictions.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
            return list(cursor)
        else:
            conn = sqlite3.connect(self.sqlite_db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT ? OFFSET ?", (limit, skip))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "location": {"latitude": r["latitude"], "longitude": r["longitude"]},
                    "risk_level": r["risk_level"],
                    "risk_score": r["risk_score"],
                    "confidence": r["confidence"],
                    "model_used": r["model_used"],
                    "input_features": json.loads(r["input_features"]) if r["input_features"] else {},
                    "explanation": r["explanation"],
                    "contributing_factors": json.loads(r["contributing_factors"]) if r["contributing_factors"] else [],
                    "safety_recommendations": json.loads(r["safety_recommendations"]) if r["safety_recommendations"] else []
                })
            conn.close()
            return results

    def clear_predictions(self):
        """Clears prediction history."""
        if self.use_mongo:
            self.mongo_db.predictions.delete_many({})
        else:
            conn = sqlite3.connect(self.sqlite_db_path)
            conn.cursor().execute("DELETE FROM predictions")
            conn.commit()
            conn.close()

    def get_accidents(self, filters: dict = None, limit: int = 500, skip: int = 0) -> List[dict]:
        """Queries historical accidents with optional filters."""
        if filters is None:
            filters = {}
            
        if self.use_mongo:
            query = {}
            for k, v in filters.items():
                if v and v != "All":
                    query[k] = v
            cursor = self.mongo_db.accidents.find(query, {"_id": 0}).skip(skip).limit(limit)
            return list(cursor)
        else:
            conn = sqlite3.connect(self.sqlite_db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            where_clauses = []
            params = []
            for k, v in filters.items():
                if v and v != "All":
                    where_clauses.append(f"{k} = ?")
                    params.append(v)
                    
            where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
            params.extend([limit, skip])
            
            cursor.execute(f"SELECT * FROM accidents{where_sql} LIMIT ? OFFSET ?", params)
            rows = cursor.fetchall()
            results = [dict(r) for r in rows]
            conn.close()
            return results

db_manager = DatabaseManager()
