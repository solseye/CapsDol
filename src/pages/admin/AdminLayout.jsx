import { useEffect, useState } from "react";
import BrandLogo from "../../components/BrandLogo";
import AdminSidebar from "./components/AdminSidebar";
import "./admin.css";

// 관리자 사이드바와 본문 영역을 모든 관리자 화면에 동일하게 적용합니다.
// 로그인/권한 확인은 상위의 ProtectedRoute(role="admin")가 담당합니다.
export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("adm-sidebar-lock", isSidebarOpen);
    return () => document.body.classList.remove("adm-sidebar-lock");
  }, [isSidebarOpen]);

  return (
    <div className={`adm-shell ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <header className="adm-mobile-header">
        <BrandLogo
          as="static"
          className="adm-mobile-brand"
          markClassName="adm-mobile-brand-mark"
          copyClassName="adm-mobile-brand-copy"
          subtitle="Admin Console"
        />
      </header>

      <button
        type="button"
        className={`adm-mobile-menu-btn ${isSidebarOpen ? "is-open" : ""}`}
        aria-label={isSidebarOpen ? "관리자 메뉴 닫기" : "관리자 메뉴 열기"}
        aria-expanded={isSidebarOpen}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        <span />
        <span />
      </button>

      <div
        className="adm-sidebar-backdrop"
        role="presentation"
        onClick={() => setIsSidebarOpen(false)}
      />

      <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
      <div className="adm-main">
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}
