export default function Recommendation() {
  return (
    <>
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
    </>
  );
}
