import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/api/user/me");
        setData(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="page muted">Loading profile…</div>;
  }

  if (error) {
    return <div className="page alert alert-error">{error}</div>;
  }

  const { profile, kyc } = data;

  const mask = (value, visible = 4) =>
    value
      ? value.slice(0, visible) + "•".repeat(value.length - visible)
      : "—";

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">
          Personal details & KYC information
        </p>
      </div>

      {/* BASIC INFO */}
      <div className="card profile-card">
        <h2 className="card-title">Basic Information</h2>

        <div className="profile-grid">
          <ProfileItem label="Full Name" value={profile?.full_name} />
          <ProfileItem label="Username" value={data.username} />
          <ProfileItem label="Email" value={data.email} />
          <ProfileItem label="Phone" value={data.phone} />
          <ProfileItem label="Role" value={data.role} />
          <ProfileItem
            label="Joined On"
            value={new Date(data.created_at).toLocaleDateString("en-IN")}
          />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="card profile-card">
        <h2 className="card-title">Address</h2>

        <div className="profile-grid">
          <ProfileItem label="Address" value={profile?.address_line} />
          <ProfileItem label="City" value={profile?.city} />
          <ProfileItem label="State" value={profile?.state} />
          <ProfileItem label="Pincode" value={profile?.pincode} />
        </div>
      </div>

      {/* KYC */}
      <div className="card profile-card">
        <h2 className="card-title">KYC Details</h2>

        <div className="profile-grid">
          <ProfileItem label="PAN" value={mask(kyc?.pan, 4)} />
          <ProfileItem label="Aadhaar" value={mask(kyc?.aadhaar, 4)} />
          <ProfileItem
            label="KYC Status"
            value={
              <span
                className={`pill pill-status-${kyc?.kyc_status?.toLowerCase()}`}
              >
                {kyc?.kyc_status}
              </span>
            }
          />
        </div>
      </div>

      {/* EMPLOYMENT */}
      <div className="card profile-card">
        <h2 className="card-title">Employment</h2>

        <div className="profile-grid">
          <ProfileItem
            label="Employment Type"
            value={profile?.employment_type}
          />
          <ProfileItem
            label="Income Range"
            value={profile?.income_range}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <div className="profile-label">{label}</div>
      <div className="profile-value">
        {value || "—"}
      </div>
    </div>
  );
}
