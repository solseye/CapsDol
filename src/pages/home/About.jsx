export default function About() {
  return (
    <>
      {/* Company */}
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
