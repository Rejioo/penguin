import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../auth/LoginPage";
import OtpPage from "../auth/OtpPage";
import RegisterPage from "../auth/RegisterPage";
import TransferPage from "../pages/transactions/TransferPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import ProfilePage from "../pages/profile/ProfilePage";

import SecurityPage from "../pages/profile/SecurityPage"


import AdminFraud from "../pages/admin/AdminFraud";




function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/transfer" element={<TransferPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/security" element={<SecurityPage />} />

      
      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      {/* admin  */}
        <Route
          path="/admin/fraud"
          element={
            <RequireAuth>
              <AdminFraud />
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
