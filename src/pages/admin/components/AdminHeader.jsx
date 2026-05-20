import { Link, useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
  };

  return (
    <header className="adm-header">
      <div>
        <p className="adm-eyebrow">Admin Dashboard</p>
        <h1>관리자 페이지</h1>
      </div>

      <div className="adm-header-actions">
        <Link to="/" className="adm-btn ghost adm-link-btn">
          홈으로
        </Link>

        <button
          type="button"
          className="adm-btn ghost"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <div className="adm-header-user">
        <span>Admin</span>
        <strong>A</strong>
      </div>
    </header>
  );
}