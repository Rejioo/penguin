import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="page muted">Loading admin dashboard…</div>;
  }

  if (error) {
    return <div className="page alert alert-error">{error}</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          System-wide overview and fraud monitoring
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid-3">
        <div className="card glass-card">
          <h3 className="card-title">Total Users</h3>
          <p className="big-amount">{stats.totalUsers}</p>
        </div>

        <div className="card glass-card">
          <h3 className="card-title">Total Accounts</h3>
          <p className="big-amount">{stats.totalAccounts}</p>
        </div>

        <div className="card glass-card">
          <h3 className="card-title">Total Transactions</h3>
          <p className="big-amount">{stats.totalTransactions}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: "1.5rem" }}>
        <div className="card glass-card">
          <h3 className="card-title">Flagged Transactions</h3>
          <p className="big-amount text-warning">
            {stats.flaggedTransactions}
          </p>
        </div>

        <div className="card glass-card">
          <h3 className="card-title">Successful</h3>
          <p className="big-amount text-success">
            {stats.successfulTransactions}
          </p>
        </div>

        <div className="card glass-card">
          <h3 className="card-title">Rejected</h3>
          <p className="big-amount text-danger">
            {stats.rejectedTransactions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
