from pydantic import BaseModel

class TransactionFeatures(BaseModel):
    amount: float
    hour: int
    is_new_device: bool
    is_foreign_transaction: bool
    transaction_count_24h: int
    device_risk_score: float
    ip_risk_score: float
    merchant_risk_score: float
    time_since_last_txn_min: float


class FraudPrediction(BaseModel):
    risk_score: float
    risk_band: str
