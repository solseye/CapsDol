import { NavLink } from "react-router-dom";

// 관리자 사이드바 메뉴 목록입니다.
// 화면에 보이는 순서도 이 배열 순서대로 결정됩니다.
const menuItems = [
  {
    to: "/admin/calendar",
    label: "Admin Dashboard",
  },
  {
    to: "/admin/users",
    label: "Users",
  },
  {
    to: "/admin/pdf-upload",
    label: "PDF Upload",
  },
  {
    to: "/admin/pdf-list",
    label: "Document Library",
  },
  {
    to: "/admin/chatbot",
    label: "AI Chatbot",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="adm-sidebar">
      {/* 💡 수정 포인트: 사용자가 로고를 클릭하면 유저 홈페이지(Home.jsx)인 "/" 경로로 탈출하도록 변경 */}
      <NavLink to="/" className="adm-brand">
        <span>◎</span>

        <div>
          <strong>WVA AI Consulting</strong>
          <small>Japan Entry OS</small>
        </div>
      </NavLink>

      {/* 관리자 메뉴 영역 */}
      <nav className="adm-menu" aria-label="관리자 메뉴">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `adm-menu-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <span>Settings</span>
        <span>Help Center</span>
        <strong>Admin Operator</strong>
      </div>
    </aside>
  );
}
