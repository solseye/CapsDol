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
    </>
  );
}
