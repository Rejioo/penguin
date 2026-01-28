// import { useState } from "react";
// import { api } from "../services/api";
// import { useNavigate } from "react-router-dom";

// export default function RegisterPage() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     fullName: "",
//     username: "",
//     email: "",
//     phone: "",
//     password: "",
//     addressLine: "",
//     city: "",
//     state: "",
//     pincode: "",
//     pan: "",
//     aadhaar: "",
//     employmentType: "",
//     incomeRange: "",
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const onChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const submit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       await api.post("/api/auth/register", form);

//       // 🔒 LOCK OTP CONTEXT
//       sessionStorage.setItem("otp_identifier", form.email);
//       sessionStorage.setItem("otp_mode", "register");

//       navigate("/otp");
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page">
//       <h1>Register</h1>

//       {error && <p className="error">{error}</p>}

//       <form onSubmit={submit}>
//         {Object.keys(form).map((key) => (
//           <input
//             key={key}
//             name={key}
//             placeholder={key}
//             value={form[key]}
//             onChange={onChange}
//             required
//           />
//         ))}

//         <button disabled={loading}>
//           {loading ? "Registering…" : "Register"}
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const STEPS = [
  "Basic Details",
  "Address",
  "KYC",
  "Employment",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);

      // Lock OTP context
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
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Step {step} of 4 — {STEPS[step - 1]}
        </p>

        {/* Progress bar */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`step-dot ${step >= s ? "active" : ""}`}
            />
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={submit}>
          {/* STEP 1 — BASIC */}
          {step === 1 && (
            <>
              <input
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={onChange}
                required
              />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={onChange}
                required
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={onChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* STEP 2 — ADDRESS */}
          {step === 2 && (
            <>
              <input
                name="addressLine"
                placeholder="Address line"
                value={form.addressLine}
                onChange={onChange}
                required
              />
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={onChange}
                required
              />
              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={onChange}
                required
              />
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* STEP 3 — KYC */}
          {step === 3 && (
            <>
              <input
                name="pan"
                placeholder="PAN"
                value={form.pan}
                onChange={onChange}
                required
              />
              <input
                name="aadhaar"
                placeholder="Aadhaar"
                value={form.aadhaar}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* STEP 4 — EMPLOYMENT */}
          {step === 4 && (
            <>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={onChange}
                required
              >
                <option value="">Employment type</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self employed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
              </select>

              <select
                name="incomeRange"
                value={form.incomeRange}
                onChange={onChange}
                required
              >
                <option value="">Income range</option>
                <option value="0-2">Below ₹2L</option>
                <option value="2-5">₹2L – ₹5L</option>
                <option value="5-10">₹5L – ₹10L</option>
                <option value="10-25">₹10L – ₹25L</option>
                <option value="25+">₹25L+</option>
              </select>
            </>
          )}

          {/* ACTIONS */}
          <div className="auth-actions">
            {step > 1 && (
              <button
                type="button"
                className="auth-btn secondary"
                onClick={back}
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                className="auth-btn primary"
                onClick={next}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="auth-btn primary"
                disabled={loading}
              >
                {loading ? "Creating…" : "Register"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
