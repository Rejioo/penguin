import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Barath Bank</div>

      <nav className="sidebar-nav">
        {/* User links */}
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/accounts">Accounts</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/transfer">Transfer</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/security">Security</NavLink>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="sidebar-divider">Admin</div>
            <NavLink to="/admin">Admin Dashboard</NavLink>
            <NavLink to="/admin/fraud">Fraud Review</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
          </>
        )}
      </nav>

      
    </aside>
  );
}
