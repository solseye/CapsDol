export default function UsageInfo() {
  return (
    <>
      {/* Flow */}
      <section id="flow">
        <div className="container">
          <div className="kicker">Flow</div>

          <h2 className="flow-title">한국 기업의 일본 진출 흐름과 절차</h2>

          <br></br>

          <div className="grid4">
            <div className="card flow-card">
              <div className="flow-num">1</div>

              <h3>상담부터 법인 설립까지 (약 2개월)</h3>

              <ul className="list">
                <li>상담, 체크리스트 작성</li>
                <li>정관 작성 및 인증</li>
                <li>등기 신청</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">2</div>

              <h3>부동산 검토 및 소개</h3>

              <ul className="list">
                <li>부동산 상담, 검토 및 소개</li>
                <li>부동산 중개</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">3</div>

              <h3>법인 계좌 개설 지원 (약 1개월)</h3>

              <ul className="list">
                <li>서류 안내</li>
                <li>서류 준비 및 제출 지원</li>
                <li>은행 심사 대응 지원</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">4</div>

              <h3>세무 · 회계 고문 계약</h3>

              <ul className="list">
                <li>사회보험 가입</li>
                <li>급여 계산</li>
                <li>취업규칙 작성</li>
                <li>세무 회계 자문</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
