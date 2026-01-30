
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [accountRes, txnRes] = await Promise.all([
          api.get("/api/accounts"),
          api.get("/api/transactions"),
        ]);

        const accounts = accountRes.data || [];
        setAccount(accounts[0] || null);

        setTransactions((txnRes.data || []).slice(0, 5));
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <div className="page">Loading dashboard…</div>;
  if (error) return <div className="page alert alert-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back{user?.username ? `, ${user.username}` : ""}
        </p>
      </div>

      {/* Insight strip */}
      {account && (
        <div className="insight-strip">
          <span className="insight-icon">📊</span>
          <span>
            Your balance is{" "}
            <b>₹{Number(account.balance).toLocaleString("en-IN")}</b>
            . {transactions.length
              ? "Here’s your recent activity."
              : "No recent transactions yet."}
          </span>
        </div>
      )}

      {/* Stats row */}
      {account && (
        <div className="dashboard-stats">
          <div className="stat-box">
            <span className="stat-label">Available Balance</span>
            <span className="stat-value">
              ₹{Number(account.balance).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Recent Transactions</span>
            <span className="stat-value">{transactions.length}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">KYC Status</span>
            <span
              className={`stat-pill ${user?.kycStatus?.toLowerCase()}`}
            >
              {user?.kycStatus || "UNKNOWN"}
            </span>
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="card">
        <h3>Recent Activity</h3>

        {transactions.length === 0 ? (
          <p className="muted">No transactions yet</p>
        ) : (
          <div className="activity-list">
            {transactions.map((tx) => {
              const isDebit =
                tx.from_account === account?.account_number;

              return (
                <div key={tx.id} className="activity-row">
                  <div className="activity-icon">
                    {isDebit ? "↗" : "↘"}
                  </div>

                  <div className="activity-info">
                    <div className="activity-text">
                      {isDebit ? "Sent" : "Received"} ₹{tx.amount}
                    </div>
                    <div className="activity-time">
                      {new Date(tx.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div
                    className={
                      isDebit ? "amount-debit" : "amount-credit"
                    }
                  >
                    {isDebit ? "-" : "+"}₹{tx.amount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust footer */}
      <div className="muted" style={{ marginTop: 16 }}>
        🔒 Protected by OTP, device fingerprinting, and fraud detection
      </div>
    </div>
  );
}
