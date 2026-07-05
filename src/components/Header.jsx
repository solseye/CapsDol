import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logoutUser } from "../api/authApi";
import {
  getCurrentLanguage,
  setCurrentLanguage,
  translate,
} from "../i18n/translations";

export default function Header({ isLoggedIn }) {
  const location = useLocation();

  const role = localStorage.getItem("role");
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", getCurrentLanguage());
  }, []);

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const switchToLanguage = (lang) => {
    // 기존 Google Translate 쿠키 방식입니다.
    // const languageMap = {
    //   ko: "/ko/ko",
    //   en: "/ko/en",
    //   ja: "/ko/ja",
    // };
    // const value = languageMap[lang] || languageMap.ko;
    // document.cookie = `googtrans=${value}; path=/`;
    // document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
    // document.documentElement.setAttribute("data-lang", lang);

    // 변경 이유: 법무/세무 용어는 자동 번역보다 직접 관리하는 번역 사전이 더 안전합니다.
    setCurrentLanguage(lang);
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
                <a href="#about">{t("common.navCompany")}</a>
              </li>
              <li>
                <a href="#service">{t("common.navService")}</a>
              </li>
              <li>
                <a href="#flow">{t("common.navFlow")}</a>
              </li>

              {!isLoggedIn && (
                <li>
                  <Link to="/login" className="btn primary nav-cta">
                    {t("common.navLogin")}
                  </Link>
                </li>
              )}

              {isLoggedIn && role === "admin" && (
                <li>
                  <Link to="/admin/calendar" className="btn primary nav-cta">
                    {t("common.navAdmin")}
                  </Link>
                </li>
              )}

              {isLoggedIn && role !== "admin" && (
                <li>
                  {/* 주소를 /reservation 으로 정확히 맞춰줍니다 */}
                  <Link to="/reservation" className="btn primary nav-cta">
                    {t("common.navReservation")}
                  </Link>
                </li>
              )}

              {isLoggedIn && role !== "admin" && (
                <li>
                  <Link to="/myreservations" className="btn primary nav-cta">
                    {t("common.navMyReservations")}
                  </Link>
                </li>
              )}

              {isLoggedIn && (
                <li>
                  <button onClick={handleLogout} className="nav-logout">
                    {t("common.navLogout")}
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
              onClick={() => switchToLanguage("en")}
            >
              EN
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
