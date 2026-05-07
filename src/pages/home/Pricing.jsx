export default function Pricing() {
  return (
    <>
      {/* Pricing */}
      <section id="pricing">
        <div className="container">
          <div className="kicker">Pricing</div>

          <h2 className="pricing-title">요금제</h2>

          <div className="grid2">
            <div className="card pricing-card">
              <h3>법인 설립</h3>

              <ul className="list_price">
                <h4>약 45만 엔 ~</h4>

                <p>세금 및 사법서사 설립 보수 포함 (상황에 따라 변동)</p>
              </ul>
            </div>

            <div className="card pricing-card">
              <h3>설립 관련 업무(한국어 지원/계좌개설 지원 등)</h3>

              <ul className="list_price">
                <h4>20만 엔 ~</h4>

                <p>
                  설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수
                  있습니다.
                </p>
              </ul>
            </div>
          </div>

          <br></br>

          <div className="kicker">
            은행 심사 기준에 따라 계좌 개설이 불가할 수 있습니다. 정확한 견적은
            상담 후 제시드립니다.
          </div>
        </div>
      </section>
    </>
  );
}
