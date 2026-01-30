

import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

// layout
import MainLayout from "../layout/MainLayout";

// auth
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import OtpPage from "../auth/OtpPage";

// user pages
import DashboardPage from "../pages/dashboard/DashboardPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import TransferPage from "../pages/transactions/TransferPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SecurityPage from "../pages/profile/SecurityPage";

// admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminFraud from "../pages/admin/AdminFraud";
import AdminUsers from "../pages/admin/AdminUsers";

export default function App() {
  return (
    <Routes>
      {/* ---------- PUBLIC ---------- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/otp" element={<OtpPage />} />

      {/* ---------- PROTECTED APP ---------- */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* User */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/fraud" element={<AdminFraud />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
