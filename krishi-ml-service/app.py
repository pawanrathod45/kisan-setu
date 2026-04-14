from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

@app.post("/predict")
def predict(data: dict):
    """
    Predict market price
    Required fields: day, month, year, weekday, arrival_qty, prev_price
    """
    features = np.array([[
        data["day"],
        data["month"],
        data["year"],
        data["weekday"],
        data["arrival_qty"],
        data["prev_price"]
    ]])

    scaled = scaler.transform(features)
    prediction = model.predict(scaled)

    return {
        "predicted_price": round(float(prediction[0]), 2),
        "commodity": "Rice",
        "location": "Kochi"
    }

@app.get("/")
def root():
    return {
        "message": "🌾 ML Price Prediction Service",
        "status": "Running",
        "model": "XGBoost",
        "commodity": "Rice",
        "location": "Kochi"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
