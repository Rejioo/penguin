import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from sklearn.calibration import CalibratedClassifierCV

# -----------------------------
# Generate synthetic dataset
# -----------------------------
np.random.seed(42)
n = 50000

data = pd.DataFrame({
    # Financial
    "amount": np.random.exponential(scale=2000, size=n),

    # Temporal
    "hour": np.random.randint(0, 24, size=n),
    "time_since_last_txn_min": np.random.exponential(scale=120, size=n),

    # Device / Network
    "is_new_device": np.random.choice([0, 1], size=n, p=[0.85, 0.15]),
    "device_risk_score": np.random.beta(2, 8, size=n),
    "ip_risk_score": np.random.beta(2, 10, size=n),

    # Geographic
    "is_foreign_transaction": np.random.choice([0, 1], size=n, p=[0.9, 0.1]),

    # Behavioral
    "transaction_count_24h": np.random.poisson(lam=2, size=n),

    # Merchant / Category abstraction
    "merchant_risk_score": np.random.beta(2, 7, size=n),
})


# Fraud logic (simulated ground truth)
fraud_score = (
    0.6 * (data["amount"] > 10000).astype(int) +
    0.5 * ((data["is_new_device"] == 1) & (data["amount"] > 3000)).astype(int) +
    0.4 * ((data["is_foreign_transaction"] == 1) & (data["hour"] < 6)).astype(int) +
    0.3 * (data["transaction_count_24h"] > 5).astype(int)
)
fraud_prob = fraud_score / fraud_score.max()
data["fraud"] = np.random.binomial(1, fraud_prob * 0.15)
print(data["fraud"].value_counts(normalize=True))

# Add label noise (realistic)
noise_rate = 0.15  
noise_idx = np.random.choice(
    data.index,
    size=int(len(data) * noise_rate),
    replace=False
)

data.loc[noise_idx, "fraud"] = 1 - data.loc[noise_idx, "fraud"]

X = data.drop("fraud", axis=1)
y = data["fraud"]

# -----------------------------
# Train model
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)
from sklearn.calibration import CalibratedClassifierCV

rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    class_weight="balanced",
    random_state=42
)

rf.fit(X_train, y_train)

model = CalibratedClassifierCV(
    rf,
    method="isotonic",
    cv=3
)

model.fit(X_train, y_train)

# model = RandomForestClassifier(
#     n_estimators=500,
#     max_depth=15,
#     class_weight="balanced",
#     n_jobs=-1,
#     random_state=42
# )

# model.fit(X_train, y_train)

# -----------------------------
# Evaluate
# -----------------------------
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

from sklearn.metrics import roc_auc_score

y_scores = model.predict_proba(X_test)[:, 1]
print("ROC-AUC:", roc_auc_score(y_test, y_scores))



# -----------------------------
# Save model
# -----------------------------
joblib.dump(model, "fraud_model.pkl")
print("Model saved to fraud_model.pkl")
