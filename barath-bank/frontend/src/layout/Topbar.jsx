import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">SmartBank</div>
        <div className="topbar-subtitle">
          {user?.role === "ADMIN" ? "Admin Console" : "Personal Banking"}
        </div>
      </div>

      <div className="topbar-right">
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
