import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function TransactionsPage() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/transactions");
        setTxns(res.data || []);
      } catch (err) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="page">Loading transactions…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <h1>Transactions</h1>

      {txns.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleString()}</td>
                <td>{t.from_account}</td>
                <td>{t.to_account}</td>
                <td>₹ {t.amount}</td>
                <td>{t.status}</td>
                <td>{t.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
