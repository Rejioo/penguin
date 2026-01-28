import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users");
      setUsers(res.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleKycAction = async (userId, action) => {
    try {
      setActionLoading(userId);
      await api.post(`/api/admin/kyc/${userId}/${action}`);
      await fetchUsers();
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
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">
          Review users and manage KYC status
        </p>
      </div>

      {loading && <div className="muted">Loading users…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && users.length === 0 && (
        <div className="muted">No users found</div>
      )}

      {!loading && users.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>KYC</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName || "-"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={
                        "pill " +
                        (u.kycStatus === "APPROVED"
                          ? "pill-safe"
                          : u.kycStatus === "REJECTED"
                          ? "pill-danger"
                          : "pill-warning")
                      }
                    >
                      {u.kycStatus}
                    </span>
                  </td>
                  <td>{u.role}</td>
                  <td>
                    {u.kycStatus === "PENDING" ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="primary-button"
                          disabled={actionLoading === u.id}
                          onClick={() =>
                            handleKycAction(u.id, "approve")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="danger-button"
                          disabled={actionLoading === u.id}
                          onClick={() =>
                            handleKycAction(u.id, "reject")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
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

export default AdminUsers;
