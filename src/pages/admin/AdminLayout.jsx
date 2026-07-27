import AdminSidebar from "./components/AdminSidebar";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="adm-shell">
      <AdminSidebar />
      <div className="adm-main">
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}
