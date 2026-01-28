import { useState } from "react";
import { api } from "../../services/api";

export default function TransferPage() {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTransfer(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/api/transactions/transfer", {
        toAccountNumber: toAccount,
        amount: Number(amount),
      });

      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Transfer failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Transfer Money</h1>

      <form onSubmit={handleTransfer}>
        <div>
          <label>To Account Number</label>
          <input
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button disabled={loading}>
          {loading ? "Processing…" : "Transfer"}
        </button>
      </form>

      {result && (
        <div className="success">
          <p>{result.message}</p>
          <p>Risk score: {result.riskScore}</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
