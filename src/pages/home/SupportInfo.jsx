export default function SupportInfo() {
  return (
    <>
      {/* Expert Info */}
      <section id="expert">
        <div className="container">
          <div className="kicker">Expert Info</div>

          <h2 className="section-title">전문가 소개</h2>

          <div className="grid2">
            <div className="card expert-card">
              <div className="expert-head">
                <div className="avatar" aria-hidden="true">
                  K
                </div>
                <h3>김명구 회계사</h3>
              </div>

              <p className="head">공인회계사 · 세무사</p>
              <ul className="list">
                <p className="muted m0">약력 및 경력</p>
                <li>2008년공인회계사 시험 합격</li>
                <li>
                  2008년~2014년 아라타 감사법인<br></br>(현 PwC Japan
                  유한책임감사법인)
                </li>
                <li>2014년공인회계사 등록</li>
                <li>2014년김공인회계사사무소 설립</li>
                <li>2015년세무사 등록</li>
                <li>2015년김공인회계사·세무사사무소 설립</li>
              </ul>
              <ul className="list">
                <p className="muted m0">전문분야</p>
                <li>일본 · 국제 세무</li>
                <li>회계 감사</li>
                <li>내부통제 구축 지원</li>
                <li>조직 재편 · M&A</li>
                <li>경영계획 수립 · 사업 재생</li>
                <li>주식 공개(IPO) 지원</li>
                <li>회계 · 재무 지원</li>
              </ul>
            </div>

            <div className="card expert-card">
              <div className="expert-head">
                <div className="avatar" aria-hidden="true">
                  G
                </div>
                <h3>카네무라 미츠아키</h3>
              </div>

              <p className="head">사법서사 · 행정서사</p>
              <ul className="list">
                <p className="muted m0">약력 및 경력</p>
                <li>2011년 오사카 체육대학 건강복지학부 졸업</li>
                <li>2016년 한일을 연결하는 사법서사 사무소 근무</li>
                <li>2023년 사법서기 시험 합격</li>
                <li>2024년 히카리 사법서사 사무소 개업</li>
                <li>2024년 행정서사 시험 합격</li>
                <li>2025년 히카리 행정서사 사무소 개업</li>
                <br></br>
              </ul>
              <ul className="list">
                <p className="muted m0">전문분야</p>
                <li>회사 설립</li>
                <li>비자 취득</li>
                <li>상속</li>
                <li>부동산 매매</li>
                <li>M&A</li>
              </ul>
            </div>
          </div>
          <h3 className="kicker">
            각 분야 자격자가 한 팀으로 움직여 일정과 품질을 동시에 확보합니다.
          </h3>
        </div>
      </section>
    </>
  );
}
