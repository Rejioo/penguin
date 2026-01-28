import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const AdminFraud = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/api/admin/transactions/flagged");

      // 🔑 normalize risk_score ONCE
      const normalized = (res.data || []).map((t) => ({
        ...t,
        risk_score:
          t.risk_score !== null && t.risk_score !== undefined
            ? Number(t.risk_score)
            : null,
      }));

      setTxns(normalized);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to load flagged transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      await api.post(`/api/admin/transactions/${id}/${action}`);
      await fetchFlagged();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Fraud Review</h1>
        <p className="page-subtitle">
          Transactions flagged by AI & rule engine
        </p>
      </div>

      {loading && <div className="muted">Loading flagged transactions…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && txns.length === 0 && (
        <div className="muted">No flagged transactions 🎉</div>
      )}

      {!loading && txns.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.from_account}</td>
                  <td>{t.to_account}</td>
                  <td>₹ {Number(t.amount).toLocaleString("en-IN")}</td>
                  <td>
                    {t.risk_score !== null ? (
                      <span
                        className={
                          "pill " +
                          (t.risk_score >= 0.75
                            ? "pill-danger"
                            : "pill-warning")
                        }
                      >
                        {t.risk_score.toFixed(2)}
                      </span>
                    ) : (
                      <span className="pill pill-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {new Date(t.created_at).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="primary-button"
                        disabled={actionLoading === t.id}
                        onClick={() => handleAction(t.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="danger-button"
                        disabled={actionLoading === t.id}
                        onClick={() => handleAction(t.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFraud;
