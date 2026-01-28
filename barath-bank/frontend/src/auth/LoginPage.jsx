import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/api/auth/login-step1", {
        identifier,
        password,
      });

      // 🔒 LOCK OTP CONTEXT
      sessionStorage.setItem("otp_identifier", identifier);
      sessionStorage.setItem("otp_mode", "login");

      navigate("/otp");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <input
          placeholder="Email or Phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading}>
          {loading ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
