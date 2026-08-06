import { Link, useNavigate } from "react-router-dom";

// 구형 관리자 화면에서 사용하는 상단 헤더입니다.
export default function AdminHeader() {
  const navigate = useNavigate();

  // 로컬 인증 정보를 비우고 홈으로 이동합니다.
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
  };

  return (
    <header className="adm-header">
      <div className="adm-breadcrumb">
        <span>Dashboard</span>
        <span>›</span>
        <strong>Operational Portal</strong>
      </div>

      <div className="adm-header-actions">
        <div className="adm-header-search">
          <span>⌕</span>
          <input placeholder="Search documents or reservations..." />
        </div>

        <Link to="/" className="adm-btn ghost adm-link-btn">
          홈으로
        </Link>

        <button type="button" className="adm-btn ghost" onClick={handleLogout}>
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
