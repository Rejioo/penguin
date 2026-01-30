import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score,
    classification_report,
    roc_curve,
    precision_recall_curve,
    average_precision_score
)

# -----------------------------
# Config
# -----------------------------
np.random.seed(42)
N_SAMPLES = 50_000
MODEL_PATH = "fraud_model.pkl"

# -----------------------------
# 1) Generate synthetic data
# -----------------------------
data = pd.DataFrame({
    "amount": np.random.exponential(scale=4000, size=N_SAMPLES),
    "hour": np.random.randint(0, 24, size=N_SAMPLES),
    "is_new_device": np.random.choice([0, 1], size=N_SAMPLES, p=[0.8, 0.2]),
    "is_foreign_transaction": np.random.choice([0, 1], size=N_SAMPLES, p=[0.85, 0.15]),
    "transaction_count_24h": np.random.poisson(lam=3, size=N_SAMPLES),
    "device_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "ip_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "merchant_risk_score": np.random.beta(2, 5, size=N_SAMPLES),
    "time_since_last_txn_min": np.random.exponential(scale=120, size=N_SAMPLES),
})

# -----------------------------
# 2) Fraud labeling logic
#   (IMPORTANT: 20+ txns rule)
# -----------------------------
fraud_score = (
    (data["amount"] > 15000).astype(int) * 0.30 +
    (data["amount"] > 40000).astype(int) * 0.45 +
    (data["is_new_device"] == 1).astype(int) * 0.15 +
    (data["is_foreign_transaction"] == 1).astype(int) * 0.25 +
    (data["transaction_count_24h"] >= 20).astype(int) * 0.45 +
    (data["device_risk_score"] > 0.65).astype(int) * 0.30 +
    (data["ip_risk_score"] > 0.65).astype(int) * 0.30 +
    (data["time_since_last_txn_min"] < 5).astype(int) * 0.15
)

prob = np.clip(fraud_score, 0, 1)
data["fraud"] = (np.random.rand(N_SAMPLES) < prob).astype(int)

print("Fraud rate:", round(data["fraud"].mean(), 4))

# -----------------------------
# 3) Train / test split
# -----------------------------
X = data.drop(columns=["fraud"])
y = data["fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    stratify=y,
    random_state=42
)

# -----------------------------
# 4) Train RandomForest
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
# 5) Evaluation
# -----------------------------
probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)

print("\nROC-AUC:", round(auc, 4))
print("\nClassification Report:")
print(classification_report(y_test, (probs > 0.5).astype(int)))

# -----------------------------
# 6) Feature importance
# -----------------------------
importance_df = pd.DataFrame({
    "feature": X.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=importance_df, x="importance", y="feature")
plt.title("Feature Importance – Fraud Model")
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
plt.show()

# -----------------------------
# 7) ROC Curve
# -----------------------------
fpr, tpr, _ = roc_curve(y_test, probs)

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, label=f"AUC = {auc:.3f}")
plt.plot([0, 1], [0, 1], "--", color="gray")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig("roc_curve.png", dpi=150)
plt.show()

# -----------------------------
# 8) Precision–Recall Curve
# -----------------------------
precision, recall, _ = precision_recall_curve(y_test, probs)
ap = average_precision_score(y_test, probs)

plt.figure(figsize=(6, 5))
plt.plot(recall, precision, label=f"AP = {ap:.3f}")
plt.xlabel("Recall")
plt.ylabel("Precision")
plt.title("Precision–Recall Curve")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig("precision_recall_curve.png", dpi=150)
plt.show()

# -----------------------------
# 9) Risk score distribution
# -----------------------------
plt.figure(figsize=(8, 5))
sns.histplot(probs[y_test == 0], bins=50, color="green", label="Legit", stat="density")
sns.histplot(probs[y_test == 1], bins=50, color="red", label="Fraud", stat="density")
plt.xlabel("Predicted Fraud Probability")
plt.ylabel("Density")
plt.title("Fraud Probability Distribution")
plt.legend()
plt.tight_layout()
plt.savefig("risk_distribution.png", dpi=150)
plt.show()

# -----------------------------
# 10) Txn velocity vs risk
# -----------------------------
test_df = X_test.copy()
test_df["prob"] = probs

plt.figure(figsize=(7, 5))
sns.boxplot(
    x=pd.cut(test_df["transaction_count_24h"], bins=[0,5,10,20,30,50]),
    y=test_df["prob"]
)
plt.xlabel("Transaction Count (24h)")
plt.ylabel("Fraud Probability")
plt.title("Transaction Velocity vs Fraud Risk")
plt.tight_layout()
plt.savefig("txn_velocity_vs_risk.png", dpi=150)
plt.show()

# -----------------------------
# 11) Save model
# -----------------------------
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved to {MODEL_PATH}")
