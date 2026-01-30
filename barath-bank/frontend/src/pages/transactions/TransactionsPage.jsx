
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function TransactionsPage() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTxns() {
      try {
        const res = await api.get("/api/transactions");
        setTxns(res.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }

    fetchTxns();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">
          Your complete transaction history
        </p>
      </div>

      {loading && <div className="muted">Loading transactions…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && txns.length === 0 && (
        <div className="muted">No transactions yet</div>
      )}

      {!loading && txns.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => {
                const isDebit = t.type === "DEBIT";

                return (
                  <tr key={t.id} className="txn-row">
                    <td>
                      {new Date(t.created_at).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {isDebit
                        ? `Transfer to ${t.to_account}`
                        : `Received from ${t.from_account}`}
                    </td>

                    <td>
                      <span
                        className={`pill ${
                          isDebit ? "pill-debit" : "pill-credit"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    <td
                      className={
                        isDebit ? "amount-debit" : "amount-credit"
                      }
                    >
                      {isDebit ? "−" : "+"}₹{" "}
                      {Number(t.amount).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`pill pill-status-${t.status.toLowerCase()}`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="muted">
                      TXN{String(t.id).padStart(6, "0")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
