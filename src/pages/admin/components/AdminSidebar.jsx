import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import BrandLogo from "../../../components/BrandLogo";
import {
  getCurrentLanguage,
  setCurrentLanguage,
} from "../../../i18n/translations";
import "./adminSidebar.css";

const menuItems = [
  {
    to: "/admin/calendar",
    label: "예약 현황 관리",
  },
  {
    to: "/admin/users",
    label: "사용자 목록",
  },
  {
    to: "/admin/chatbot",
    label: "관리자 챗봇",
  },
  {
    to: "/admin/pdf-list",
    label: "PDF 업로드 및 자료 목록",
  },
];

// 관리자 주요 메뉴, 언어 선택, 로그아웃을 한 곳에서 제공합니다.
export default function AdminSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage);

  useEffect(() => {
    // 언어 메뉴 바깥 클릭을 감지해 팝오버를 닫습니다.
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 로컬 인증 정보를 삭제하고 사용자 홈으로 돌아갑니다.
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  // 선택한 관리자 언어를 로컬 스토리지에 저장합니다.
  const handleSelectLang = (lang) => {
    setSelectedLang(lang);
    setCurrentLanguage(lang);
    setIsLangOpen(false);
    window.location.reload();
  };

  return (
    <aside className="adm-sidebar">
      <BrandLogo
        as="static"
        className="adm-brand"
        markClassName="adm-brand-mark"
        copyClassName="adm-brand-copy"
        subtitle="Japan Entry OS"
      />

      <nav className="adm-menu" aria-label="관리자 메뉴">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `adm-menu-link ${isActive ? "active" : ""}`
            }
            onClick={onNavigate}
          >
            <span className="adm-menu-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        <div className="adm-profile-item">
          <div className="adm-profile-avatar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="adm-profile-info">
            <strong>Admin</strong>
          </div>
        </div>

        
        <div className="adm-lang-wrapper" ref={langMenuRef}>
          {isLangOpen && (
            <div className="adm-lang-popover">
              <button
                type="button"
                className={`adm-lang-option ${selectedLang === "ko" ? "active" : ""}`}
                onClick={() => handleSelectLang("ko")}
              >
                <span className="lang-flag">🇰🇷</span>
                <span>한국어</span>
              </button>
              <button
                type="button"
                className={`adm-lang-option ${selectedLang === "ja" ? "active" : ""}`}
                onClick={() => handleSelectLang("ja")}
              >
                <span className="lang-flag">🇯🇵</span>
                <span>日本語</span>
              </button>
              <button
                type="button"
                className={`adm-lang-option ${selectedLang === "en" ? "active" : ""}`}
                onClick={() => handleSelectLang("en")}
              >
                <span className="lang-flag">🇺🇸</span>
                <span>English</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="adm-footer-btn"
            onClick={() => setIsLangOpen((prev) => !prev)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>
              언어 설정 ({selectedLang === "ko" ? "KO" : selectedLang === "ja" ? "JP" : "EN"})
            </span>
            <span className={`adm-caret ${isLangOpen ? "open" : ""}`}>▶</span>
          </button>
        </div>

        
        <button
          type="button"
          className="adm-footer-btn adm-logout-btn"
          onClick={handleLogout}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
