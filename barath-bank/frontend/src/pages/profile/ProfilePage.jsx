import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/user/me")
      .then((res) => setProfile(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load profile")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <h1>My Profile</h1>

      <div className="card">
        <p><strong>Name:</strong> {profile.fullName}</p>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>

        <p>
          <strong>KYC Status:</strong>{" "}
          <span className={`pill pill-${profile.kycStatus?.toLowerCase()}`}>
            {profile.kycStatus}
          </span>
        </p>
      </div>
    </div>
  );
}
