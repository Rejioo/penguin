// src/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">SmartBank</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/accounts">Accounts</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </aside>
  );
}
