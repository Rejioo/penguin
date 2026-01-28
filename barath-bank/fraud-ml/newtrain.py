import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import joblib

np.random.seed(42)
n = 50000  # good demo size

data = pd.DataFrame({
    "amount": np.random.exponential(scale=4000, size=n),
    "hour": np.random.randint(0, 24, size=n),
    "is_new_device": np.random.choice([0, 1], size=n, p=[0.8, 0.2]),
    "is_foreign_transaction": np.random.choice([0, 1], size=n, p=[0.85, 0.15]),
    "transaction_count_24h": np.random.poisson(lam=2, size=n),
    "device_risk_score": np.random.beta(2, 5, size=n),
    "ip_risk_score": np.random.beta(2, 5, size=n),
    "merchant_risk_score": np.random.beta(2, 5, size=n),
    "time_since_last_txn_min": np.random.exponential(scale=120, size=n)
})

# --- Probabilistic fraud labeling ---
fraud_score = (
    (data["amount"] > 15000).astype(int) * 0.35 +
    (data["amount"] > 40000).astype(int) * 0.5 +
    (data["is_new_device"] == 1).astype(int) * 0.25 +
    (data["is_foreign_transaction"] == 1).astype(int) * 0.25 +
    (data["transaction_count_24h"] >= 5).astype(int) * 0.3 +
    (data["device_risk_score"] > 0.6).astype(int) * 0.3 +
    (data["ip_risk_score"] > 0.6).astype(int) * 0.3 +
    (data["time_since_last_txn_min"] < 5).astype(int) * 0.2
)

# Convert score → probability → label
prob = np.clip(fraud_score, 0, 1)
data["fraud"] = (np.random.rand(n) < prob).astype(int)

X = data.drop(columns=["fraud"])
y = data["fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_leaf=50,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

preds = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, preds)

print("ROC-AUC:", auc)
print("Fraud rate:", y.mean())

joblib.dump(model, "fraud_model.pkl")
print("Model saved as fraud_model.pkl")
