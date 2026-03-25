import React, { useState } from 'react';
import "../App.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from "react-router-dom";

export default function Home() {
  // FAQ open states (4개)
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  return (
    <div className="App">
    <div id="top"></div>
      {/* Header */}
      <Header />

      {/* Hero */}
      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="kicker">한국 기업의 일본 현지 법인 설립 및 세무회계 고문</div>
              <h1 className="title">WVA</h1>
              <p className="subtitle">
                일본 진출 예정 또는 이미 진출한 한국 기업을 지원합니다.<br></br>
                “일본 현지법인 설립부터 세무·회계, 비자 취득 등의 절차 및 이후 사업 운영 전반까지 고민을 해소해 드립니다.”
              </p>

              <div className="pill-row" aria-label="핵심 키워드">
              </div>
            </div>
            </div>
        </section>

        {/* Recommendation */}
        <section id="recommendation">
          <div className="container">
            <h2 className="rec-title">이런 기업에게 추천합니다</h2>

            <div className="grid">
              <div className="card rec-card">
                <div className="rec-num">1</div>
                <h3 className="muted">
                  일본에 진출하고자 하지만, 현지 법인 설립 절차가 복잡하게 느껴지는 기업
                </h3>
              </div>

              <div className="card rec-card">
                <div className="rec-num">2</div>
                <h3 className="muted">
                  회사 설립, 부동산 중개, 세무, 회계, 노무 등 종합적인 지원이 필요한 경우
                </h3>
              </div>

              <div className="card rec-card">
                <div className="rec-num">3</div>
                <h3 className="muted">
                  한국어로 상담부터 모든 과정이 진행되기를 원하는 기업
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
                  세무 리스크를 줄이고, 안정적인 일본 사업 운영을 원하시는 기업
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

        {/* Service */}
        <section id="service">
          <div className="container">
            <div className="kicker">Services</div>
            <h2 className="section-title">서비스</h2>

            <div className="grid3">
              <div className="card">
                <h3>법인 설립</h3>
                <ul className="list">
                  <li>법인 설립 컨설팅</li>
                  <li>정관 작성 및 인증</li>
                  <li>법인 인감 제작</li>
                </ul>
              </div>

              <div className="card">
                <h3>비자 발행</h3>
                <ul className="list">
                  <li>취업 비자</li>
                  <li>경영 관리 비자</li>
                </ul>
              </div>

              <div className="card">
                <h3>계좌 개설</h3>
                <ul className="list">
                  <li>한국계 은생을 중심으로 법인 계좌 개설을 지원</li>
                </ul>
              </div>

              <div className="card">
                <h3>세무/회계</h3>
                <ul className="list">
                  <li>기장 대행</li>
                  <li>세무 신고</li>
                  <li>세무 상담</li>
                </ul>
              </div>

              <div className="card">
                <h3>인사/노무</h3>
                <ul className="list">
                  <li>사회 보험</li>
                  <li>급여 계산</li>
                  <li>취업 규칙 작성</li>
                </ul>
              </div>

              <div className="card">
                <h3>부동산 중개</h3>
                <ul className="list">
                  <li>투자용 부동산 중개</li>
                  <li>상업용 부동산 중개</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow">
        <div className="container">
            <div className="kicker">Flow</div>
            <h2 className="flow-title">한국 기업의 일본 진출 흐름과 절차</h2>

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
                <h3>법인 계좌 개설 지원 (약 1개월 반)</h3>
                <ul className="list">
                <li>서류 안내</li>
                <li>서류 준비 및 제출 지원</li>
                <li>은행 심사 대응 지원</li>
                </ul>
            </div>

            <div className="card flow-card">
                <div className="flow-num">4</div>
                <h3>세무, 회계 고문 계약</h3>
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
                <h3>약 45만 엔 ~</h3>
                <p> 세금 및 사법서사 설립 보수 포함 (상황에 따라 변동)</p>
                </ul>
            </div>

            <div className="card pricing-card">
                <h3>설립 관련 업무(한국어 지원/계좌개설 지원 등)</h3>
                <ul className="list_price">
                <h3>20만 엔 ~</h3>
                <p>설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수 있습니다.</p>
                </ul>
            </div>

            <div className="card pricing-card">
                <h3>비자 발행</h3>
                <ul className="list_price">
                <h3>상담 후 안내</h3>
                <p>설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수 있습니다.</p>
                </ul>
            </div>

            <div className="card pricing-card">
                <h3>회계,세무 고문</h3>
                <ul className="list_price">
                <h3>월 7만 엔 ~</h3>
                <p>체류자격 종류/난이도에 따라 상이</p>
                </ul>
            </div>

            <div className="card pricing-card">
                <h3>인사, 노무</h3>
                <ul className="list_price">
                <h3>12만 엔 ~</h3>
                <p>사회보험 신규 적용 12만 엔~, 급여 계산 1만 엔 + 2천 엔/1인</p>
                <p>취업규칙 30만 엔~</p>
                </ul>
            </div>
            
            </div>
            <br></br>
            <div className="kicker">은행 심사 기준에 따라 계좌 개설이 불가할 수 있습니다. 정확한 견적은 상담 후 제시드립니다.</div>
        </div>
        </section>

        {/* FAQ */}
        <section id="faq">
        <div className="container">
            <div className="kicker">FAQ</div>
            <h2 className="faq-title">자주 묻는 질문</h2>

            <div className="grid">
            {[
            {
                q: "비거주자(일본에 거주하지 않는 사람)도 회사를 설립할 수 있나요?",
                a: "일반적으로 대표가 일본 비거주자여도 법인 설립 절차 진행은 가능합니다. 다만 지점(支店) 설립의 경우 일본 거주 책임자가 필요할 수 있습니다.",
            },
            {
                q: "자본금은 많을수록 좋은가요?",
                a: "자본금 규모에 따라 소비세 면세 여부, 과세 방식 등 달라질 수 있습니다. 사업 모델과 초기 투자 계획을 함께 검토해 적정 자본금을 설계합니다.",
            },
            {
                q: "회사 설립 후에 해야 할 절차에는 어떤 것이 있나요?",
                a: "회사 설립 후에는 세무서 및 지방자치단체에 대한 각종 신고에 더해, 사회보험 및 노동보험 관련 절차도 필요합니다. 직원을 고용하는 경우에는 노동기준감독서나 고용노동서(헬로워크)에도 신고해야 합니다. 이러한 절차는 복잡하며, 적절한 기한 관리가 매우 중요합니다.",
            },
            {
                q: "한국 본사로부터 상품을 구매해 일본 자회사가 판매할 계획입니다. 이 경우 어떤 점에 유의해야 하나요?",
                a: "이전가격(Transfer Pricing)에 대한 세무 리스크를 검토해야 하며, 거래 조건과 가격 산정 근거를 갖추는 것이 중요합니다.",
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

        {/* Expert Info */}
        <section id="expert">
          <div className="container">
            <div className="kicker">Expert Info</div>

            <h2 className="section-title">전문가 소개</h2>
            <h3 className="kicker">각 분야 자격자가 한 팀으로 움직여 일정과 품질을 동시에 확보합니다.</h3>

            <div className="grid2">
              <div className="card expert-card">
                <div className="expert-head">
                  <div className="avatar" aria-hidden="true">K</div>
                  <h3>김명국 회계사</h3>
                </div>

                <p className="muted m0">공인회계사(CPA) · 세무/회계 · 국제세무</p>
                <ul className="list">
                  <li>일본 진출 구조 설계(설립/운영/세무 리스크)</li>
                  <li>기장·결산·법인세/소비세 등 세무 신고</li>
                  <li>한·일 거래(이전가격 등) 이슈 점검</li>
                </ul>
              </div>

              <div className="card expert-card">
                <div className="expert-head">
                  <div className="avatar" aria-hidden="true">G</div>
                  <h3>가네무라 사법서사 · 행정사</h3>
                </div>

                <p className="muted m0">사법서사(등기) · 행정사(비자/허가)</p>
                <ul className="list">
                  <li>정관/등기 서류 작성 및 설립 등기</li>
                  <li>비자(취업/경영·관리) 신청 서류 준비</li>
                  <li>각종 행정 절차, 허가/신고 대응</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* Chatbot Floating Button */}
      <div className="chat-fab">
        <Link to="/chat" className="btn primary nav-cta">
          상담 (챗봇)
        </Link>
      </div>
    </div>
  );
}
