import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AccountsPage() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/accounts")
      .then((res) => {
        setAccount(res.data[0]); // single account
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load account");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <h1>My Account</h1>

      <div className="card">
        <p><strong>Account Number:</strong> {account.account_number}</p>
        <p><strong>Balance:</strong> ₹{account.balance}</p>
        <p><strong>Status:</strong> {account.status}</p>
        <p><strong>Currency:</strong> {account.currency}</p>
      </div>
    </div>
  );
}
