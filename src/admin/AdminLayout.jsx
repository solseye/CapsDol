import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="adm-shell">
      <AdminSidebar />
      <div className="adm-main">
        <AdminHeader />
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}
