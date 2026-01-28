import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

# -----------------------------
# Config
# -----------------------------
np.random.seed(42)
N_SAMPLES = 50000
MODEL_PATH = "fraud_model.pkl"

# -----------------------------
# 1) Generate synthetic data
# -----------------------------
data = pd.DataFrame({
    "amount": np.random.exponential(scale=4000, size=N_SAMPLES),
    "hour": np.random.randint(0, 24, size=N_SAMPLES),
    "is_new_device": np.random.choice([0, 1], size=N_SAMPLES, p=[0.8, 0.2]),
    "is_foreign_transaction": np.random.choice([0, 1], size=N_SAMPLES, p=[0.85, 0.15]),
    "transaction_count_24h": np.random.poisson(lam=2, size=N_SAMPLES),
    "device_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "ip_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "merchant_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "time_since_last_txn_min": np.random.exponential(scale=120, size=N_SAMPLES),
})

# -----------------------------
# 2) Probabilistic fraud labeling
# -----------------------------
fraud_score = (
    (data["amount"] > 15000).astype(int) * 0.35 +
    (data["amount"] > 40000).astype(int) * 0.50 +
    (data["is_new_device"] == 1).astype(int) * 0.25 +
    (data["is_foreign_transaction"] == 1).astype(int) * 0.25 +
    (data["transaction_count_24h"] >= 5).astype(int) * 0.30 +
    (data["device_risk_score"] > 0.6).astype(int) * 0.30 +
    (data["ip_risk_score"] > 0.6).astype(int) * 0.30 +
    (data["time_since_last_txn_min"] < 5).astype(int) * 0.20
)

prob = np.clip(fraud_score, 0, 1)
data["fraud"] = (np.random.rand(N_SAMPLES) < prob).astype(int)

print("Fraud rate:", data["fraud"].mean())

# -----------------------------
# 3) Train / test split
# -----------------------------
X = data.drop(columns=["fraud"])
y = data["fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

# -----------------------------
# 4) Train model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_leaf=50,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# -----------------------------
# 5) Evaluate
# -----------------------------
probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)

print("\nROC-AUC:", auc)
print("\nClassification Report:")
print(classification_report(y_test, (probs > 0.5).astype(int)))

# -----------------------------
# 6) Feature importance
# -----------------------------
importances = model.feature_importances_
importance_df = (
    pd.DataFrame({
        "feature": X.columns,
        "importance": importances
    })
    .sort_values(by="importance", ascending=False)
)

print("\nFeature Importance:")
print(importance_df)

plt.figure(figsize=(10, 6))
sns.barplot(
    data=importance_df,
    x="importance",
    y="feature",
    palette="viridis"
)
plt.title("Fraud Model Feature Importance")
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
plt.show()

# -----------------------------
# 7) Save model
# -----------------------------
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved to {MODEL_PATH}")
