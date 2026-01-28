import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

// Auth pages
import LoginPage from "../auth/LoginPage";
import OtpPage from "../auth/OtpPage";
import RegisterPage from "../auth/RegisterPage";

// Layouts
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";

// User pages
import DashboardPage from "../pages/dashboard/DashboardPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountDetailsPage from "../pages/accounts/AccountDetailsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import TransferPage from "../pages/transactions/TransferPage";
import ProfilePage from "../pages/profile/ProfilePage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminFraud from "../pages/admin/AdminFraud";
import AdminUsers from "../pages/admin/AdminUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User protected */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/:id" element={<AccountDetailsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin protected */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="fraud" element={<AdminFraud />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
