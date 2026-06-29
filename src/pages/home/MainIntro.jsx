import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 추가!
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import { getCurrentLanguage, translate } from "../../i18n/translations";

export default function MainIntro() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  // 스크롤 동작 확인후 Scroll Down 문구 없어지게 만드는거 인식하는 구문
  const [scrollOpacity, setScrollOpacity] = useState(1);
  //검색어 변수
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const newOpacity = Math.max(1 - currentScroll / 600, 0);
      setScrollOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (!isLoggedIn) {
      // 로그인이 안되어있을 때
      alert(t("home.loginRequired"));
      navigate("/login");
    } else {
      // 로그인이 되어있는 상황
      navigate("/chat", { state: { initialQuery: searchQuery } });
    }
  };
  //

  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ position: "relative" }}>
        <div className="hero-slideshow" aria-hidden="true">
          <div
            className="hero-slide slide-1"
            style={{ backgroundImage: `url(${image1})` }}
          />
          <div
            className="hero-slide slide-2"
            style={{ backgroundImage: `url(${image2})` }}
          />
          <div
            className="hero-slide slide-3"
            style={{ backgroundImage: `url(${image3})` }}
          />
        </div>

        <div className="container hero-grid">
          <div className="hero-content">
            <div className="kicker">
              {t("home.heroKicker")}
            </div>
            <h1 className="title">WVA</h1>

            <form
              className="hero-search"
              onSubmit={handleSearchSubmit} //폼 제출 함수 연결
            >
              <input
                type="text"
                placeholder={t("home.chatbotPlaceholder")}
                value={searchQuery} // 입력창 값 연결
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label={t("home.search")}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="#555"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <p className="subtitle">
              {t("home.heroSubtitle1")}
              <br />
              {t("home.heroSubtitle2")}
            </p>

            <div className="pill-row" aria-label="핵심 키워드"></div>
          </div>
        </div>
        <div
          className="scroll-down-btn"
          onClick={() => {
            document
              .getElementById("recommendation")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            opacity: scrollOpacity,
            pointerEvents: scrollOpacity > 0 ? "auto" : "none",
          }}
        >
          <span>{t("home.scrollDown")}</span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Recommendation */}
      <section id="recommendation">
        <div className="container">
          <h2 className="rec-title">{t("home.recommendationTitle")}</h2>
          <div className="kicker">{t("home.recommendationDesc")}</div>

          <br />
          <br />

          <div className="grid">
            <div className="card rec-card">
              <div className="rec-num">1</div>
              <h3 className="muted">
                {t("home.rec1")}
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">2</div>
              <h3 className="muted">
                {t("home.rec2")}
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">3</div>
              <h3 className="muted">
                {t("home.rec3")}
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">4</div>
              <h3 className="muted">
                {t("home.rec4")}
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">5</div>
              <h3 className="muted">
                {t("home.rec5")}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about">
        <div className="container">
          <div className="kicker">{t("home.companyKicker")}</div>
          <h2 className="section-title">{t("home.companyTitle")}</h2>

          <div className="grid2">
            <div className="card">
              <h3>{t("home.companyServiceTitle")}</h3>
              <p className="muted">{t("home.companyServiceDesc")}</p>
            </div>

            <div className="card">
              <h3>{t("home.workMethodTitle")}</h3>
              <ul className="list">
                <li>{t("home.workStep1")}</li>
                <li>{t("home.workStep2")}</li>
                <li>{t("home.workStep3")}</li>
                <li>{t("home.workStep4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
