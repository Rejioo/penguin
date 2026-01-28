import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page muted">Checking admin session…</div>;
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but not admin
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="app-main">
        <Topbar title="Admin Panel" subtitle="Fraud & system control" />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
