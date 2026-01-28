// import { Routes, Route, Navigate } from "react-router-dom";
// import RequireAuth from "./RequireAuth";

// // Auth
// import LoginPage from "../auth/LoginPage";
// import OtpPage from "../auth/OtpPage";
// import RegisterPage from "../auth/RegisterPage";

// // User pages
// import DashboardPage from "../pages/dashboard/DashboardPage";
// import AccountsPage from "../pages/accounts/AccountsPage";
// import TransactionsPage from "../pages/transactions/TransactionsPage";
// import TransferPage from "../pages/transactions/TransferPage";
// import ProfilePage from "../pages/profile/ProfilePage";
// import SecurityPage from "../pages/profile/SecurityPage";

// // Admin pages
// import AdminDashboard from "../pages/admin/AdminDashboard";
// import AdminFraud from "../pages/admin/AdminFraud";
// import AdminUsers from "../pages/admin/AdminUsers";

// function App() {
//   return (
//     <Routes>
//       {/* -------- Public -------- */}
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/otp" element={<OtpPage />} />
//       <Route path="/register" element={<RegisterPage />} />

//       {/* -------- Protected (User) -------- */}
//       <Route
//         path="/dashboard"
//         element={
//           <RequireAuth>
//             <DashboardPage />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/accounts"
//         element={
//           <RequireAuth>
//             <AccountsPage />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/transactions"
//         element={
//           <RequireAuth>
//             <TransactionsPage />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/transfer"
//         element={
//           <RequireAuth>
//             <TransferPage />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/profile"
//         element={
//           <RequireAuth>
//             <ProfilePage />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/security"
//         element={
//           <RequireAuth>
//             <SecurityPage />
//           </RequireAuth>
//         }
//       />

//       {/* -------- Protected (Admin) -------- */}
//       <Route
//         path="/admin"
//         element={
//           <RequireAuth>
//             <AdminDashboard />
//           </RequireAuth>
//         }
//       />

//       <Route
//         path="/admin/fraud"
//         element={
//           <RequireAuth>
//             <AdminFraud />
//           </RequireAuth>
//         }
//       />

//       <Route
//           path="/admin/users"
//           element={
//             <RequireAuth>
//               <AdminUsers />
//             </RequireAuth>
//           }
//         />


//       {/* -------- Default -------- */}
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }

// export default App;
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

// Layouts
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";

// Auth
import LoginPage from "../auth/LoginPage";
import OtpPage from "../auth/OtpPage";
import RegisterPage from "../auth/RegisterPage";

// User pages
import DashboardPage from "../pages/dashboard/DashboardPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import TransferPage from "../pages/transactions/TransferPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SecurityPage from "../pages/profile/SecurityPage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminFraud from "../pages/admin/AdminFraud";
import AdminUsers from "../pages/admin/AdminUsers";

function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ---------- User Area ---------- */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>

      {/* ---------- Admin Area ---------- */}
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/fraud" element={<AdminFraud />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* ---------- Default ---------- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
