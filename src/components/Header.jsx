import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

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
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <Link to="/chat" className="btn primary nav-cta">
                  챗봇
                </Link>
              </li>
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
