import { Outlet } from "react-router-dom";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="adm-shell">
      <AdminSidebar />
      <div className="adm-main">
        <AdminHeader />
        {/* children이 없을 때는 /admin/calendar 같은 하위 라우트 화면을 표시합니다. */}
        <main className="adm-content">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
