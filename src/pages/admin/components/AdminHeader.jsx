import { logoutAndGoHome } from "../../../utils/logout";

// 구형 관리자 화면에서 사용하는 상단 헤더입니다.
export default function AdminHeader() {
  // 서버/로컬 세션을 함께 정리하고 메인 페이지로 돌아갑니다.
  const handleLogout = async () => {
    await logoutAndGoHome();
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
