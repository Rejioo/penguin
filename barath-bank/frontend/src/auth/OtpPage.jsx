import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const OTP_LENGTH = 6;

export default function OtpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const identifier = sessionStorage.getItem("otp_identifier");
  const mode = sessionStorage.getItem("otp_mode"); // "login" | "register"

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  if (!identifier || !mode) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid session</h1>
          <p className="auth-subtitle">
            OTP session expired. Please login again.
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.post("/api/auth/login-step2", {
          identifier,
          otp: otpValue,
        });

        login(res.data);
        sessionStorage.clear();
        navigate("/dashboard");
      } else {
        await api.post("/api/auth/verify-otp", {
          identifier,
          otp: otpValue,
        });

        sessionStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card otp-card">
        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to <b>{identifier}</b>
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
          </div>

          <button className="primary-button" disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>

        <div className="otp-footer">
          <span className="muted">Didn’t receive the code?</span>
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Restart login
          </button>
        </div>
      </div>
    </div>
  );
}
