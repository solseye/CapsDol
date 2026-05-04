import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";

export default function MainIntro() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
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
          <div>
            <div className="kicker">
              한국 기업의 일본 현지 법인 설립 및 세무회계 고문
            </div>
            <h1 className="title">WVA</h1>
            <p className="subtitle">
              일본 진출 예정 또는 이미 진출한 한국 기업을 지원합니다.
              <br />
              “일본 현지법인 설립부터 세무·회계, 비자 취득 등의 절차 및 이후
              사업 운영 전반까지 고민을 해소해 드립니다.”
            </p>

            <div className="pill-row" aria-label="핵심 키워드"></div>
          </div>
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
