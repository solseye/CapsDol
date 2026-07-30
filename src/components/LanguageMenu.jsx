import { useEffect, useRef, useState } from "react";
import { getCurrentLanguage, setCurrentLanguage } from "../i18n/translations";

const LANGUAGE_OPTIONS = [
  { code: "ko", label: "한국어", shortLabel: "KO" },
  { code: "ja", label: "日本語", shortLabel: "JP" },
  { code: "en", label: "English", shortLabel: "EN" },
];

const LANGUAGE_MENU_COPY = {
  ko: {
    label: "언어 선택",
    current: (language) => `언어 선택, 현재 ${language}`,
  },
  en: {
    label: "Select language",
    current: (language) => `Select language, current language: ${language}`,
  },
  ja: {
    label: "言語を選択",
    current: (language) => `言語を選択、現在の言語：${language}`,
  },
};

export default function LanguageMenu({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = getCurrentLanguage();
  const copy =
    LANGUAGE_MENU_COPY[currentLanguage] || LANGUAGE_MENU_COPY.ko;
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const currentOption =
    LANGUAGE_OPTIONS.find((option) => option.code === currentLanguage) ||
    LANGUAGE_OPTIONS[0];

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.setAttribute("data-lang", currentLanguage);

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
  }, [currentLanguage]);

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
      aria-label={copy.label}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
      onFocus={openMenu}
    >
      <button
        type="button"
        className="language-menu-trigger"
        onClick={openMenu}
        aria-expanded={isOpen}
        aria-label={copy.current(currentOption.label)}
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
