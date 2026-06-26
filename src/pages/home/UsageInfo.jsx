import { useState } from "react";

export default function UsageInfo() {
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  return (
    <>
      {/* Flow */}
      <section id="flow">
        <div className="container">
          <div className="kicker">Flow</div>
          <h2 className="flow-title">한국 기업의 일본 진출 흐름과 절차</h2>
          <br></br>
          <div className="grid4">
            {/* 기존 2단계 흐름은 삭제하지 않고 보존합니다.
                요청 이미지처럼 상담 준비부터 노무까지 전체 흐름을 한눈에 보여주기 위해
                아래에 4단계 버전으로 확장했습니다.
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
              <h3>세무 · 회계 고문 계약</h3>
              <ul className="list">
                <li>사회보험 가입</li>
                <li>급여 계산</li>
                <li>취업규칙 작성</li>
                <li>세무 회계 자문</li>
              </ul>
            </div>
            */}

            <div className="card flow-card">
              <div className="flow-num">1</div>
              <h3>상담 및 사전 준비</h3>
              <ul className="list">
                <li>초기 상담 및 진출 전략 협의</li>
                <li>체크리스트 작성 및 서류 안내</li>
                <li>법인 형태 결정 (KK / GK)</li>
                <li>자본금 · 사업 목적 설정</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">2</div>
              <h3>법인 설립 절차</h3>
              <ul className="list">
                <li>정관 작성 및 인증</li>
                <li>자본금 납입</li>
                <li>등기 신청</li>
                <li>법인 인감 등록</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">3</div>
              <h3>세무 · 회계 고문</h3>
              <ul className="list">
                <li>세무 · 회계 자문</li>
                <li>기장 대행 및 결산</li>
                <li>세무 신고 (법인세 · 소비세)</li>
                <li>정기 재무 리포트</li>
              </ul>
            </div>

            <div className="card flow-card">
              <div className="flow-num">4</div>
              <h3>노무 · 사회보험</h3>
              <ul className="list">
                <li>사회보험 가입 절차</li>
                <li>급여 계산 체계 구축</li>
                <li>연말정산</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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
                <p> 세금 및 사법서사 설립 보수 포함 (상황에 따라 변동)</p>
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

            <div className="card pricing-card">
              <h3>비자 발행</h3>
              <ul className="list_price">
                <h4>상담 후 안내</h4>
                <p>
                  설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수
                  있습니다.
                </p>
              </ul>
            </div>

            <div className="card pricing-card">
              <h3>회계 · 세무 고문</h3>
              <ul className="list_price">
                <h4>월 7만 엔 ~</h4>
                <p>체류자격 종류/난이도에 따라 상이</p>
              </ul>
            </div>

            <div className="card pricing-card">
              <h3>인사, 노무</h3>
              <ul className="list_price">
                <h4>12만 엔 ~</h4>
                <p>사회보험 신규 적용 12만 엔~</p>
                <p>급여 계산 1만 엔 + 2천 엔/1인</p>
                <p>취업규칙 30만 엔~</p>
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
