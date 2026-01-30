import { useAuth } from "../auth/AuthContext";

export default function AdminTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar admin">
      <div className="topbar-left">
        <div className="topbar-title">SmartBank</div>
        <div className="topbar-subtitle">Admin Console</div>
      </div>

      <div className="topbar-right">
        <span className="role-badge admin">ADMIN</span>

        <span className="user-name">
          {user?.username || user?.email}
        </span>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
