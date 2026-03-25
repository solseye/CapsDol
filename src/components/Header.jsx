import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header>
      <div className="container nav">
        <Link to="/" className="brand" onClick={handleLogoClick}>
          <span className="logo" aria-hidden="true" />
          <span>WVA</span>
        </Link>

        <nav aria-label="주요 메뉴">
          <ul>
            <li><a href="#about">회사 개요</a></li>
            <li><a href="#service">서비스</a></li>
            <li><a href="#flow">업무 흐름</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li>
              <Link to="/chat" className="btn primary nav-cta">
                상담 시트 작성
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}