import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../auth/LoginPage";
import OtpPage from "../auth/OtpPage";
import RegisterPage from "../auth/RegisterPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
