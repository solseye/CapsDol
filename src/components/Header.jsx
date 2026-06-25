import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../api/authApi";

export default function Header({ isLoggedIn }) {
  const location = useLocation();

  const role = localStorage.getItem("role");

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const switchToLanguage = (lang) => {
    const value = lang === "ja" ? "/ko/ja" : "/ko/ko";

    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

    document.documentElement.setAttribute("data-lang", lang);

    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      window.location.href = "/";
    } catch (err) {
      console.error("로그아웃 실패:", err);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      window.location.href = "/";
    }
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <Link to="/" className="brand" onClick={handleLogoClick}>
          <span className="logo" aria-hidden="true" />
          <span>WVA</span>
        </Link>

        <div className="nav-right">
          <nav className="main-nav" aria-label="주요 메뉴">
            <ul>
              <li>
                <a href="#about">회사 개요</a>
              </li>
              <li>
                <a href="#service">서비스</a>
              </li>
              <li>
                <a href="#flow">업무 흐름</a>
              </li>

              {!isLoggedIn && (
                <li>
                  <Link to="/login" className="btn primary nav-cta">
                    로그인
                  </Link>
                </li>
              )}

              {isLoggedIn && role === "admin" && (
                <li>
                  <Link to="/admin/calendar" className="btn primary nav-cta">
                    관리자 페이지
                  </Link>
                </li>
              )}

              {isLoggedIn && role !== "admin" && (
                <li>
                  {/* 주소를 /reservation 으로 정확히 맞춰줍니다 */}
                  <Link to="/reservation" className="btn primary nav-cta">
                    상담 예약
                  </Link>
                </li>
              )}

              {isLoggedIn && role !== "admin" && (
                <li>
                  <Link to="/myreservations" className="btn primary nav-cta">
                    상담 내역
                  </Link>
                </li>
              )}

              {isLoggedIn && (
                <li>
                  <button onClick={handleLogout} className="nav-logout">
                    로그아웃
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="lang-toggle" aria-label="언어 전환">
            <button
              type="button"
              className="lang-option"
              onClick={() => switchToLanguage("ko")}
            >
              KO
            </button>
            <button
              type="button"
              className="lang-option"
              onClick={() => switchToLanguage("ja")}
            >
              JA
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
