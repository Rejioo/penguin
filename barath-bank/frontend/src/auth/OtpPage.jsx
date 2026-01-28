import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function OtpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 SINGLE SOURCE OF TRUTH
  const identifier = sessionStorage.getItem("otp_identifier");
  const mode = sessionStorage.getItem("otp_mode");

  if (!identifier || !mode) {
    return <p>Invalid OTP session</p>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.post("/api/auth/login-step2", {
          identifier,
          otp,
        });

        login(res.data);

        sessionStorage.clear();
        navigate("/dashboard");
      } else {
        await api.post("/api/auth/verify-otp", {
          identifier,
          otp,
          purpose: "REGISTER",
        });

        sessionStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Enter OTP</h1>
      <p>Sent to {identifier}</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit OTP"
          required
        />
        <button disabled={loading}>
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
