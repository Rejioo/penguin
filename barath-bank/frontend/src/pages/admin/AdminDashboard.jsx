
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load admin stats"));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <div className="muted">Loading admin dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System-wide banking overview</p>
      </div>

      <div className="grid-3">
        <div className="card stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats.totalTransactions}</div>
        </div>

        <div className="card stat-card stat-warning">
          <div className="stat-label">Flagged Transactions</div>
          <div className="stat-value">{stats.flaggedTransactions}</div>
        </div>

        <div className="card stat-card stat-success">
          <div className="stat-label">Successful Transactions</div>
          <div className="stat-value">{stats.successfulTransactions}</div>
        </div>

        <div className="card stat-card stat-danger">
          <div className="stat-label">Rejected Transactions</div>
          <div className="stat-value">{stats.rejectedTransactions}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{stats.totalAccounts}</div>
        </div>
      </div>
    </div>
  );
}
