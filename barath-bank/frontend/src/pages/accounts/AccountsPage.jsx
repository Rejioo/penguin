import { useEffect, useState } from "react";
import { api } from "../../services/api";
import AccountCard from "../../components/AccountCard";

export default function AccountsPage() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        setLoading(true);
        const res = await api.get("/api/accounts");
        setAccount(res.data?.[0] || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load account");
      } finally {
        setLoading(false);
      }
    }

    fetchAccount();
  }, []);

  if (loading) {
    return <div className="page muted">Loading account…</div>;
  }

  if (error) {
    return <div className="page alert alert-error">{error}</div>;
  }

  if (!account) {
    return <div className="page muted">No account found</div>;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Account</h1>
        <p className="page-subtitle">
          Your primary banking account
        </p>
      </div>

      {/* Credit card UI */}
      <div style={{ marginBottom: "32px" }}>
        <AccountCard account={account} />
      </div>

      {/* Account details */}
      <div className="card">
        <h3 className="card-title">Account Details</h3>

        <div className="account-details-grid">
          <div>
            <div className="muted">Account Number</div>
            <div>{account.account_number}</div>
          </div>

          <div>
            <div className="muted">Status</div>
            <span
              className={`pill pill-status-${account.status.toLowerCase()}`}
            >
              {account.status}
            </span>
          </div>

          <div>
            <div className="muted">Currency</div>
            <div>{account.currency}</div>
          </div>

          <div>
            <div className="muted">Created On</div>
            <div>
              {new Date(account.created_at).toLocaleDateString("en-IN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
