import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function SecurityPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/security/sessions")
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading security activity…</div>;

  return (
    <div className="page">
      <h1>Security</h1>
      <p className="muted">
        Review devices and locations that accessed your account.
      </p>

      <div className="card">
        {sessions.length === 0 ? (
          <p>No login history available.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Last Seen</th>
                <th>IP</th>
                <th>Country</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{new Date(s.last_seen).toLocaleString()}</td>
                  <td>{s.ip_address}</td>
                  <td>{s.country_code || "-"}</td>
                  <td>
                    {s.device_hash.slice(0, 8)}…
                  </td>
                  <td>
                    {s.is_trusted ? (
                      <span className="pill pill-safe">Trusted</span>
                    ) : (
                      <span className="pill pill-warning">Untrusted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
