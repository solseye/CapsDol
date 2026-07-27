import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentLanguage, translate } from "../../i18n/translations";
import "../../styles/sonny-selected-home.css";

export default function MainIntroSelected() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const quickPrompts = [
    "일본 지점과 현지 법인(KK/GK)의 차이점은?",
    "일본 법인 설립 초기 비용은 어떻게 잡아야 해?",
    "소비세 인보이스 제도 등록은 언제 필요해?",
    "경영관리 비자를 준비할 때 가장 중요한 요건은?",
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const isLoggedIn = !!localStorage.getItem("accessToken");
    if (!isLoggedIn) {
      alert(t("home.loginRequired"));
      navigate("/login");
      return;
    }

    navigate("/chat", { state: { initialQuery: searchQuery } });
  };

  return (
    <section className="selected-hero" id="home">
      <div className="selected-hero-inner">
        <p className="selected-kicker">{t("home.heroKicker")}</p>
        <h1 className="selected-hero-title">
          일본 진출 준비,
          <br />
          <span>AI 상담과 전문가 연결</span>로 빠르게 시작하세요
        </h1>
        <p className="selected-hero-desc">
          {t("home.heroSubtitle1")} {t("home.heroSubtitle2")}
        </p>

        <form className="selected-search" onSubmit={handleSearchSubmit}>
          <span className="selected-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="text"
            placeholder={t("home.chatbotPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">{t("home.search")}</button>
        </form>

        <div className="selected-prompt-row" aria-label="자주 묻는 질문">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setSearchQuery(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
