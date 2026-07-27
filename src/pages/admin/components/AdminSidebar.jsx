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
    to: "/admin/users",
    label: "사용자 목록",
  },
  {
    to: "/admin/chatbot",
    label: "AI Chatbot",
  },
];

export default function AdminSidebar() {
  return (
    <aside className="adm-sidebar">
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
