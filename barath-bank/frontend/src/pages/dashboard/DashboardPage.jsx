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

        const accounts = accountRes.data;
        setAccount(accounts?.[0] || null);

        setTransactions((txnRes.data || []).slice(0, 5));
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <div className="page">Loading dashboard…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <p>Welcome back{user?.username ? `, ${user.username}` : ""}</p>

      {!account ? (
        <p>No account found</p>
      ) : (
        <div className="card">
          <h3>Primary Account</h3>
          <p><b>Account:</b> {account.account_number}</p>
          <p><b>Balance:</b> ₹{account.balance}</p>
        </div>
      )}

      <div className="card">
        <h3>Recent Transactions</h3>

        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleString()}</td>
                  <td>{tx.type}</td>
                  <td>₹{tx.amount}</td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
