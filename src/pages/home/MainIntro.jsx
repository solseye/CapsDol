import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 추가!
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";

export default function MainIntro() {
  // 스크롤 동작 확인후 Scroll Down 문구 없어지게 만드는거 인식하는 구문
  const [scrollOpacity, setScrollOpacity] = useState(1);
  //검색어 변수
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  //
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const newOpacity = Math.max(1 - currentScroll / 600, 0);
      setScrollOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 검색 제출 시 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return; // 아무것도 안 쳤으면 무시

    // 로그인 여부 확인 (보통 localStorage의 accessToken이나 user 정보로 확인합니다)
    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (!isLoggedIn) {
      // 경우 1: 로그인이 안 되어 있을 때
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    } else {
      // 경우 2: 로그인이 되어 있을 때 -> 챗봇 페이지(/chat)로 검색어를 싸들고 이동!
      // ⚠️ 만약 챗봇 페이지 주소가 /chat 이 아니라면 상황에 맞게 변경해주세요.
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
              한국 기업의 일본 현지 법인 설립 및 세무회계 고문
            </div>
            <h1 className="title">WVA</h1>

            {/* 💡 4. 검색 폼 부분 업데이트 */}
            <form
              className="hero-search"
              onSubmit={handleSearchSubmit} // 👈 폼 제출 함수 연결
            >
              <input
                type="text"
                placeholder="일본 진출 서비스 챗봇 (예: 법인 설립, 비자 관련 내용)"
                value={searchQuery} // 👈 입력창 값 연결
                onChange={(e) => setSearchQuery(e.target.value)} // 👈 글자 칠 때마다 상태 업데이트
              />
              <button type="submit" aria-label="검색">
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
              일본 진출 예정 또는 이미 진출한 한국 기업을 지원합니다.
              <br />
              “일본 현지법인 설립부터 세무·회계, 비자 취득 등의 절차 및 이후
              사업 운영 전반까지 고민을 해소해 드립니다.”
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
          <span>Scroll Down</span>
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
          <h2 className="rec-title">이런 기업에게 추천드립니다</h2>
          <div className="kicker">
            일본 진출은 “설립”보다 “운영”이 더 어렵습니다. 설립부터 운영
            체계까지 함께 만듭니다.
          </div>

          <br />
          <br />

          <div className="grid">
            <div className="card rec-card">
              <div className="rec-num">1</div>
              <h3 className="muted">
                일본에 진출하고자 하지만, 현지 법인 설립 절차가 복잡하게
                느껴지는 기업
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">2</div>
              <h3 className="muted">
                회사 설립, 부동산 중개, 세무, 회계, 노무 등 종합적인 지원이
                필요한 경우
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">3</div>
              <h3 className="muted">
                상담부터 진행까지 한국어로 진행하길 원하는 경우
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">4</div>
              <h3 className="muted">
                일본 비즈니스 환경에 정통한 전문가의 컨설팅이 필요한 경우
              </h3>
            </div>

            <div className="card rec-card">
              <div className="rec-num">5</div>
              <h3 className="muted">
                세무 리스크를 줄이고, 안정적인 일본 사업 운영을 원하는 기업
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about">
        <div className="container">
          <div className="kicker">Company</div>
          <h2 className="section-title">회사 개요</h2>

          <div className="grid2">
            <div className="card">
              <h3>회사에서 제공하는 서비스</h3>
              <p className="muted">
                한국 기업의 일본 진출 과정에서 “복잡한 절차를 이해하기 쉽게”
                정리하고, 실행 단계에서 필요한 준비물을 빠르게 맞추도록
                돕습니다.
              </p>
            </div>

            <div className="card">
              <h3>작업 방식</h3>
              <ul className="list">
                <li>챗봇 상담 → 요구사항/목표 확인</li>
                <li>히어링 시트 기반 정보 수집</li>
                <li>진출 형태/일정/예산 가이드 제시</li>
                <li>운영 단계 체크리스트 제공</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
