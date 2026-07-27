import { useEffect, useRef, useState } from "react";
import { getCurrentLanguage, setCurrentLanguage } from "../i18n/translations";

const LANGUAGE_OPTIONS = [
  { code: "ko", label: "한국어", shortLabel: "KO" },
  { code: "ja", label: "日本語", shortLabel: "JP" },
  { code: "en", label: "English", shortLabel: "EN" },
];

export default function LanguageMenu({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = getCurrentLanguage();
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const currentOption =
    LANGUAGE_OPTIONS.find((option) => option.code === currentLanguage) ||
    LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const openMenu = () => {
    window.clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const closeMenuWithDelay = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 650);
  };

  const handleSelectLanguage = (language) => {
    if (language === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setCurrentLanguage(language);
    window.location.reload();
  };

  return (
    <div
      className={`language-menu ${className}`.trim()}
      ref={menuRef}
      aria-label="언어 선택"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
      onFocus={openMenu}
    >
      <button
        type="button"
        className="language-menu-trigger"
        onClick={openMenu}
        aria-expanded={isOpen}
        aria-label={`언어 선택, 현재 ${currentOption.label}`}
      >
        <span className="language-globe" aria-hidden="true">
          <i />
        </span>
        <strong>{currentOption.shortLabel}</strong>
      </button>

      {isOpen && (
        <div className="language-menu-list" role="menu">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.code}
              className={option.code === currentLanguage ? "active" : ""}
              onClick={() => handleSelectLanguage(option.code)}
              role="menuitem"
            >
              <strong>{option.shortLabel}</strong>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
