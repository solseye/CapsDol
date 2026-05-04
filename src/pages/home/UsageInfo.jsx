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

      {/* FAQ */}
      <section id="faq">
        <div className="container">
          <div className="kicker">FAQ</div>
          <h2 className="faq-title">자주 묻는 질문</h2>
          <br></br>
          <div className="grid">
            {[
              {
                q: "일본 법인에 소비세 납부 의무에 대하여.납부 의무 요건",
                a: "1. 전전 사업연도(기준 기간).의 과세 매출액이 1,000만 엔 이상인 경우 \n 2. 과세 사업자를 스스로 선택한 경우 \n 3. 인보이스 등록(적격 청구 사업자)을 한 경우",
              },
              {
                q: "2.일본 법인에서 한국 본사로 이자를 송금할 때 원천징수 세율은 몇 퍼센트인가?",
                a: "1. 원칙적으로 20.42% \n 2. 조세조약 특례(조세조약 특례 적용 신고가 필요) 10%",
              },
              {
                q: "3.국경을 넘는 EC(아마존·Qoo10)를 활용한 일본 진출 시, 납세 관리인과 인보이스 등록 여부",
                a: "1. 일본 국내에서 과세 매출액이 1,000만 엔을 초과한 경우(기준 기간의 원칙). \n 2. 인보이스 등록을 하는 경우(면세 사업자라도 등록하면 납세 의무가 발생하기 때문에).",
              },
            ].map((item, idx) => (
              <div className="faq-item faq-card" key={idx}>
                <div className="faq-badge">Q</div>

                <button
                  className="faq-q"
                  type="button"
                  onClick={() =>
                    setFaqOpen((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    })
                  }
                >
                  {item.q}
                  <span className="chev">{faqOpen[idx] ? "–" : "+"}</span>
                </button>

                {faqOpen[idx] && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
