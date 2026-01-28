export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <a href="/admin">Dashboard</a>
        <a href="/admin/fraud">Fraud</a>
        <a href="/admin/users">Users</a>
      </nav>
    </aside>
  );
}
