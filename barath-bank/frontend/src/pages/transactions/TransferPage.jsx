import { useState } from "react";
import { api } from "../../services/api";

export default function TransferPage() {
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/api/transactions/transfer", {
        toAccountNumber,
        amount: Number(amount),
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  const riskScore = result?.riskScore;

  const riskClass =
    riskScore >= 0.75
      ? "danger"
      : riskScore >= 0.45
      ? "warning"
      : "safe";

  return (
    <div className="transfer-page">
      <div className="transfer-card">
        <h1 className="transfer-title">Transfer Money</h1>
        <p className="transfer-subtitle">
          Secure transfer with AI fraud detection
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="transfer-form" onSubmit={submit}>
          <div>
            <label>Recipient Account Number</label>
            <input
              placeholder="BAxxxxxxxxxxxx"
              value={toAccountNumber}
              onChange={(e) => setToAccountNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              type="number"
              placeholder="₹ Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="transfer-action">
            <button disabled={loading}>
              {loading ? "Processing…" : "Transfer"}
            </button>
          </div>
        </form>

        {result && (
          <div className={`transfer-risk ${riskClass}`}>
            <strong>Status:</strong>{" "}
            {result.decision || "Processed"}
            <br />
            <strong>Risk score:</strong>{" "}
            {riskScore?.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
