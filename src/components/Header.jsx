import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const animateScrollTo = (targetY, duration = 900) => {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      animateScrollTo(0, 900);
    }
  };

  const handleSectionClick = (e, id) => {
    e.preventDefault();

    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return;

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;

      const targetTop =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        12;

      window.history.replaceState(null, "", `#${id}`);
      animateScrollTo(targetTop, 900);
    };

    if (location.pathname === "/") {
      scrollToTarget();
    } else {
      navigate("/");

      setTimeout(() => {
        scrollToTarget();
      }, 120);
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
                <a
                  href="#about"
                  onClick={(e) => handleSectionClick(e, "about")}
                >
                  회사 개요
                </a>
              </li>
              <li>
                <a
                  href="#service"
                  onClick={(e) => handleSectionClick(e, "service")}
                >
                  서비스
                </a>
              </li>
              <li>
                <a href="#flow" onClick={(e) => handleSectionClick(e, "flow")}>
                  업무 흐름
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleSectionClick(e, "faq")}>
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/reservation" className="btn primary nav-cta">
                  상담 예약
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
