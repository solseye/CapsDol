import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { logoutUser } from "../api/authApi";
import LanguageMenu from "./LanguageMenu";
import {
  getCurrentLanguage,
  translate,
} from "../i18n/translations";

export default function Header({ isLoggedIn }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMyPageMenuOpen, setIsMyPageMenuOpen] = useState(false);
  const myPageMenuCloseTimer = useRef(null);

  const role = localStorage.getItem("role");
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);
  const isAdmin = role === "admin";
  // 챗봇도 개인 작업 흐름에 포함해 마이페이지와 동일한 사용자용 헤더를 사용합니다.
  const isMyPageSection =
    location.pathname.startsWith("/mypage") || location.pathname === "/chat";
  const isReservationSection = location.pathname === "/reservation";
  const isHearingSection = location.pathname === "/hearing-sheet";

  const mainNavItems = isReservationSection
    ? [
        { to: "/mypage", label: "마이 페이지" },
        { to: "/hearing-sheet", label: "히어링 시트" },
        { to: "/reservation", label: t("common.navReservation") },
      ]
    : isHearingSection
    ? [
        { to: "/mypage", label: "마이페이지" },
        { to: "/reservation", label: t("common.navReservation") },
      ]
    : isMyPageSection
    ? [
        { to: "/mypage", label: "마이 페이지" },
        { to: "/hearing-sheet", label: "히어링 시트" },
        { to: "/reservation", label: t("common.navReservation") },
      ]
    : [
        { to: "/#services", label: t("common.navService") },
        { to: "/#method", label: t("common.navFlow") },
        { to: "/#experts", label: "전문가" },
        { to: "/#standards", label: "운영 방식" },
      ];

  const isActivePath = (path) => {
    if (path.startsWith("/#")) {
      return (
        location.pathname === "/" &&
        location.hash === path.slice(1)
      );
    }

    if (!isMyPageSection && !isReservationSection && !isHearingSection) return false;

    if (path === "/mypage") {
      return location.pathname === "/mypage";
    }

    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", getCurrentLanguage());
  }, []);

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMyPageMenuOpen(false);
  };

  const openMyPageMenu = () => {
    window.clearTimeout(myPageMenuCloseTimer.current);
    setIsMyPageMenuOpen(true);
  };

  const closeMyPageMenuWithDelay = () => {
    window.clearTimeout(myPageMenuCloseTimer.current);
    myPageMenuCloseTimer.current = window.setTimeout(() => {
      setIsMyPageMenuOpen(false);
    }, 260);
  };

  useEffect(() => () => window.clearTimeout(myPageMenuCloseTimer.current), []);

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
          <span className="logo" aria-hidden="true">◎</span>
          <span className="brand-copy">
            <strong>WVA AI Consulting</strong>
            <small>일본 진출 운영 시스템</small>
          </span>
        </Link>

        <div className="nav-right">
          <nav className="main-nav" aria-label="주요 메뉴">
            <ul>
              {isMyPageSection && (
                <li
                  className="nav-dropdown"
                  onMouseEnter={openMyPageMenu}
                  onMouseLeave={closeMyPageMenuWithDelay}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      closeMyPageMenuWithDelay();
                    }
                  }}
                >
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${location.pathname === "/mypage" ? "active" : ""}`}
                    aria-expanded={isMyPageMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      window.clearTimeout(myPageMenuCloseTimer.current);
                      setIsMyPageMenuOpen((open) => !open);
                    }}
                  >
                    마이 페이지 <span aria-hidden="true">⌄</span>
                  </button>
                  <div className={`nav-dropdown-menu ${isMyPageMenuOpen ? "is-open" : ""}`} role="menu">
                    <Link to="/mypage/reservations" role="menuitem" onClick={() => setIsMyPageMenuOpen(false)}>
                      내 상담 내역
                    </Link>
                    <Link to="/mypage/files" role="menuitem" onClick={() => setIsMyPageMenuOpen(false)}>
                      내 파일 관리
                    </Link>
                  </div>
                </li>
              )}

              {mainNavItems
                .filter((item) => !isMyPageSection || item.to !== "/mypage")
                .map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={isActivePath(item.to) ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {!isLoggedIn && (
                <li>
                  <Link to="/login" className="btn primary nav-cta">
                    {t("common.navLogin")}
                  </Link>
                </li>
              )}

              {isLoggedIn && isAdmin && (
                <li>
                  <Link to="/admin/calendar" className="btn primary nav-cta">
                    {t("common.navAdmin")}
                  </Link>
                </li>
              )}

              {isLoggedIn && !isAdmin && !isMyPageSection && !isReservationSection && !isHearingSection && (
                <li>
                  <Link to="/mypage" className="btn ghost nav-cta">
                    {t("common.navMyReservations")}
                  </Link>
                </li>
              )}

              {isLoggedIn &&
                !isAdmin &&
                !isMyPageSection &&
                !isReservationSection &&
                !isHearingSection && (
                <li>
                  {/* 주소를 /reservation 으로 정확히 맞춰줍니다 */}
                  <Link to="/reservation" className="btn ghost nav-cta">
                    {t("common.navReservation")}
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

          <LanguageMenu />

          <button
            type="button"
            className={`site-menu-toggle ${isMobileMenuOpen ? "is-open" : ""}`}
            aria-label="메뉴 열기"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
          </button>
        </div>

        <div className={`site-mobile-menu ${isMobileMenuOpen ? "is-open" : ""}`}>
          <nav aria-label="모바일 메뉴">
            {mainNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActivePath(item.to) ? "active" : ""}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            {isMyPageSection && (
              <>
                <Link
                  to="/mypage/reservations"
                  className={isActivePath("/mypage/reservations") ? "active" : ""}
                  onClick={closeMobileMenu}
                >
                  내 상담 내역
                </Link>
                <Link
                  to="/mypage/files"
                  className={isActivePath("/mypage/files") ? "active" : ""}
                  onClick={closeMobileMenu}
                >
                  내 파일 관리
                </Link>
              </>
            )}
          </nav>

          <div className="site-mobile-actions">
            {!isLoggedIn && (
              <>
                <Link to="/login" className="btn ghost" onClick={closeMobileMenu}>
                  {t("common.navLogin")}
                </Link>
                <Link to="/signup" className="btn primary" onClick={closeMobileMenu}>
                  회원가입
                </Link>
              </>
            )}

            {isLoggedIn && isAdmin && (
              <Link
                to="/admin/calendar"
                className="btn primary"
                onClick={closeMobileMenu}
              >
                {t("common.navAdmin")}
              </Link>
            )}

            {isLoggedIn && !isAdmin && (
              <>
                {!isMyPageSection && !isReservationSection && !isHearingSection && (
                  <Link to="/mypage" className="btn ghost" onClick={closeMobileMenu}>
                    {t("common.navMyReservations")}
                  </Link>
                )}
                {!isMyPageSection && !isReservationSection && !isHearingSection && (
                  <Link
                    to="/reservation"
                    className="btn ghost"
                    onClick={closeMobileMenu}
                  >
                    {t("common.navReservation")}
                  </Link>
                )}
              </>
            )}

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn primary"
              >
                {t("common.navLogout")}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
