from fastapi import FastAPI
from schemas import TransactionFeatures, FraudPrediction
import random
import joblib
import numpy as np
model = joblib.load("fraud_model.pkl")

app = FastAPI(
    title="Fraud Detection Service",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# @app.post("/predict", response_model=FraudPrediction)
# def predict_fraud(features: TransactionFeatures):
#     """
#     Placeholder fraud prediction.
#     ML model will replace this logic.
#     """

#     # TEMP: mock risk score
#     risk_score = round(random.uniform(0, 1), 2)

#     return FraudPrediction(
#         risk_score=risk_score,
#         model="mock-model"
#     )
@app.post("/predict", response_model=FraudPrediction)
def predict_fraud(features: TransactionFeatures):
    X = np.array([[
    features.amount,
    features.hour,
    int(features.is_new_device),
    int(features.is_foreign_transaction),
    features.transaction_count_24h,
    features.device_risk_score,
    features.ip_risk_score,
    features.merchant_risk_score,
    features.time_since_last_txn_min
    ]])
    risk = model.predict_proba(X)[0][1]

    if risk >= 0.75:
        band = "HIGH"
    elif risk >= 0.4:
        band = "MEDIUM"
    else:
        band = "LOW"


    # return FraudPrediction(
    #     risk_score=round(float(risk), 2),
    #     model="random_forest"
    # )
    return {
        "risk_score": round(float(risk), 3),
        "risk_band": band
    }