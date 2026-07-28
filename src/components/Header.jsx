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
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownAreaRef = useRef(null);

  const role = localStorage.getItem("role");
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);
  const isAdmin = role === "admin";
  const isUserWorkspace = isLoggedIn && !isAdmin;
  const isMyPageSection =
    location.pathname.startsWith("/mypage") || location.pathname === "/chat";
  const isReservationSection = location.pathname === "/reservation";
  const isHearingSection = location.pathname === "/hearing-sheet";

  const mainNavItems = isUserWorkspace
    ? [{ to: "/reservation", label: t("common.navReservation") }]
    : isReservationSection
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
    setOpenDropdown(null);
  };

  useEffect(() => {
    const closeDropdownOnOutsideClick = (event) => {
      if (!dropdownAreaRef.current?.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const closeDropdownOnEscape = (event) => {
      if (event.key === "Escape") setOpenDropdown(null);
    };

    document.addEventListener("mousedown", closeDropdownOnOutsideClick);
    document.addEventListener("keydown", closeDropdownOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeDropdownOnOutsideClick);
      document.removeEventListener("keydown", closeDropdownOnEscape);
    };
  }, []);

  const toggleDropdown = (menuName) => {
    setOpenDropdown((current) => (current === menuName ? null : menuName));
  };

  const mobileNavItems = isUserWorkspace
    ? [
        { to: "/mypage", label: "마이페이지" },
        { to: "/mypage/reservations", label: "내 상담 내역" },
        { to: "/mypage/files", label: "내 파일 관리" },
        { to: "/hearing-sheet", label: "히어링 시트 작성" },
        { to: "/chat", label: "AI 챗봇" },
        { to: "/reservation", label: t("common.navReservation") },
      ]
    : mainNavItems;

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
          <nav className="main-nav" aria-label="주요 메뉴" ref={dropdownAreaRef}>
            <ul>
              {isUserWorkspace ? (
                <>
                  <li className="nav-dropdown">
                  <button
                    type="button"
                    className={`nav-dropdown-trigger ${location.pathname.startsWith("/mypage") ? "active" : ""}`}
                    aria-expanded={openDropdown === "mypage"}
                    aria-haspopup="menu"
                    onClick={() => toggleDropdown("mypage")}
                  >
                    마이페이지 <span aria-hidden="true">⌄</span>
                  </button>
                  <div className={`nav-dropdown-menu ${openDropdown === "mypage" ? "is-open" : ""}`} role="menu">
                    <Link to="/mypage" role="menuitem" onClick={() => setOpenDropdown(null)}>
                      마이페이지 홈
                    </Link>
                    <Link to="/mypage/reservations" role="menuitem" onClick={() => setOpenDropdown(null)}>
                      내 상담 내역
                    </Link>
                    <Link to="/mypage/files" role="menuitem" onClick={() => setOpenDropdown(null)}>
                      내 파일 관리
                    </Link>
                  </div>
                  </li>

                  <li className="nav-dropdown">
                    <button
                      type="button"
                      className={`nav-dropdown-trigger ${(isHearingSection || location.pathname === "/chat") ? "active" : ""}`}
                      aria-expanded={openDropdown === "tools"}
                      aria-haspopup="menu"
                      onClick={() => toggleDropdown("tools")}
                    >
                      사전진단 <span aria-hidden="true">⌄</span>
                    </button>
                    <div className={`nav-dropdown-menu ${openDropdown === "tools" ? "is-open" : ""}`} role="menu">
                      <Link to="/hearing-sheet" role="menuitem" onClick={() => setOpenDropdown(null)}>
                        히어링 시트 작성
                      </Link>
                      <Link to="/chat" role="menuitem" onClick={() => setOpenDropdown(null)}>
                        AI 챗봇
                      </Link>
                    </div>
                  </li>

                  <li>
                    <Link to="/reservation" className={isReservationSection ? "active" : ""}>
                      {t("common.navReservation")}
                    </Link>
                  </li>
                </>
              ) : (
                mainNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={isActivePath(item.to) ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                </li>
                ))
              )}

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

              {isLoggedIn && !isAdmin && !isUserWorkspace && !isMyPageSection && !isReservationSection && !isHearingSection && (
                <li>
                  <Link to="/mypage" className="btn ghost nav-cta">
                    {t("common.navMyReservations")}
                  </Link>
                </li>
              )}

              {isLoggedIn &&
                !isAdmin && !isUserWorkspace &&
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
            {mobileNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActivePath(item.to) ? "active" : ""}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
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
                {!isUserWorkspace && !isMyPageSection && !isReservationSection && !isHearingSection && (
                  <Link to="/mypage" className="btn ghost" onClick={closeMobileMenu}>
                    {t("common.navMyReservations")}
                  </Link>
                )}
                {!isUserWorkspace && !isMyPageSection && !isReservationSection && !isHearingSection && (
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
