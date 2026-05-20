import { Link } from "react-router-dom"; // 💡 1. 렌더링 에러를 막기 위해 Link 임포트 추가!

export default function AdminHeader() {
  return (
    <header className="adm-header">
      <div>
        <p className="adm-eyebrow">Admin Dashboard</p>
        <h1>관리자 페이지</h1>
      </div>

      {/* 💡 2. 기존 admin.css 스타일에 맞게 우측 상단 '홈으로' 버튼 레이아웃 정돈 */}
      <div style={{ marginLeft: "auto", marginRight: "16px" }}>
        <Link
          to="/"
          className="adm-btn ghost"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          홈으로
        </Link>
      </div>

      <div className="adm-header-user">
        <span>Admin</span>
        <strong>A</strong>
      </div>
    </header>
  );
}
