import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",
    employmentType: "",
    incomeRange: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);

      // 🔒 LOCK OTP CONTEXT
      sessionStorage.setItem("otp_identifier", form.email);
      sessionStorage.setItem("otp_mode", "register");

      navigate("/otp");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Register</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={form[key]}
            onChange={onChange}
            required
          />
        ))}

        <button disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}
