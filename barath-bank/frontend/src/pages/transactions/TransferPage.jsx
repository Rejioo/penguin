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

  return (
    <div className="page">
      <h1>Transfer Money</h1>

      <form onSubmit={submit}>
        <div>
          <label>To Account Number</label>
          <input
            value={toAccountNumber}
            onChange={(e) => setToAccountNumber(e.target.value)}
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
        <pre style={{ marginTop: 16 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
