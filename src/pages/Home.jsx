import React, { useEffect, useState } from "react";
import "../App.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  // FAQ open states (4개)
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  useEffect(() => {
    const currentLang = document.cookie.includes("/ko/ja") ? "ja" : "ko";
    document.documentElement.setAttribute("data-lang", currentLang);

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "ko",
          includedLanguages: "ko,ja",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    const existingScript = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user);
      });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {/* 숨겨진 Google Translate 위젯 */}
      <div
        id="google_translate_element"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
        }}
      />

      <div id="top"></div>

      {/* Header */}
      <Header isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="kicker">
                한국 기업의 일본 현지 법인 설립 및 세무회계 고문
              </div>
              <h1 className="title">WVA</h1>
              <p className="subtitle">
                일본 진출 예정 또는 이미 진출한 한국 기업을 지원합니다.<br></br>
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
            <br></br>
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

        {/* Service */}
        <section id="service">
          <div className="container">
            <div className="kicker">Services</div>
            <h2 className="section-title">서비스</h2>

            <div className="grid3">
              <div className="card">
                <div className="service-head">
                <div className="avatar" aria-hidden="true">
                    B
                  </div>
                  <h3>법인 설립</h3>
                </div>
                <ul className="list">
                  <li>법인 설립 컨설팅</li>
                  <li>정관 작성 및 인증</li>
                  <li>법인 인감 제작</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    V
                  </div>
                  <h3>비자 발행</h3>
                </div>
                <ul className="list">
                  <li>취업 비자</li>
                  <li>경영 관리 비자</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    G
                  </div>
                  <h3>계좌 개설</h3>
                </div>
                <ul className="list">
                  <li>한국계 은행과의 중개</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    S
                  </div>
                  <h3>세무 · 회계</h3>
                </div>
                <ul className="list">
                  <li>기장 및 재무보고</li>
                  <li>세무 신고 (법인·소득·소비)</li>
                  <li>세무 컨설팅 및 스킴 설계</li>
                  <li>국제조세 (PE 판정, 조세조약)</li>
                  <li>세무조사 동행</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    I
                  </div>
                  <h3>인사 · 노무</h3>
                </div>
                <ul className="list">
                  <li>급여 계산</li>
                  <li>사회보험 가입 절차</li>
                  <li>노동보험 가입 절차</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    B
                  </div>
                  <h3>부동산 중개</h3>
                </div>
                <ul className="list">
                  <li>부동산 관련 업체 중개</li>
                </ul>
              </div>

              <div className="card">
                <div className="service-head">
                  <div className="avatar" aria-hidden="true">
                    H
                  </div>
                  <h3>회계 · 감사</h3>
                </div>
                <ul className="list">
                  <li>임의 감사</li>
                  <li>회사법 감사</li>
                  <li>일본 자회사의 PKG 감사</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/*hearing sheet*/}
        <section id="hearing-shortcuts">
          <div className="container">
            <div className="kicker">Hearing Sheet</div>
            <h2 className="section-title">분야별 히어링 시트</h2>
            <p className="section-desc">상담이 필요한 분야를 선택해 주세요.</p>

            <div className="hearing-grid">
              {[
                { title: "인사", desc: "채용 및 인사 운영 관련 상담" },
                { title: "법무", desc: "계약 및 법률 검토 관련 상담" },
                { title: "회계", desc: "세무 및 회계 관리 관련 상담" },
                { title: "노무", desc: "노동 및 급여 관련 상담" },
              ].map((item) => (
                <Link
                  key={item.title}
                  to="/hearing-sheet"
                  className="card hearing-shortcut-card"
                >
                  <div className="hearing-icon">{item.title[0]}</div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.desc}</p>
                  <span className="hearing-link">히어링 시트 작성 →</span>
                </Link>
              ))}
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
                  <h3>약 45만 엔 ~</h3>
                  <p> 세금 및 사법서사 설립 보수 포함 (상황에 따라 변동)</p>
                </ul>
              </div>

              <div className="card pricing-card">
                <h3>설립 관련 업무(한국어 지원/계좌개설 지원 등)</h3>
                <ul className="list_price">
                  <h3>20만 엔 ~</h3>
                  <p>
                    설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수
                    있습니다.
                  </p>
                </ul>
              </div>

              <div className="card pricing-card">
                <h3>비자 발행</h3>
                <ul className="list_price">
                  <h3>상담 후 안내</h3>
                  <p>
                    설립 후 세무서 제출 서류는 고문 계약 범위에 포함될 수
                    있습니다.
                  </p>
                </ul>
              </div>

              <div className="card pricing-card">
                <h3>회계 · 세무 고문</h3>
                <ul className="list_price">
                  <h3>월 7만 엔 ~</h3>
                  <p>체류자격 종류/난이도에 따라 상이</p>
                </ul>
              </div>

              <div className="card pricing-card">
                <h3>인사, 노무</h3>
                <ul className="list_price">
                  <h3>12만 엔 ~</h3>
                  <p>사회보험 신규 적용 12만 엔~</p>
                  <p>급여 계산 1만 엔 + 2천 엔/1인</p>
                  <p>취업규칙 30만 엔~</p>
                </ul>
              </div>
            </div>
            <br></br>
            <div className="kicker">
              은행 심사 기준에 따라 계좌 개설이 불가할 수 있습니다. 정확한
              견적은 상담 후 제시드립니다.
            </div>
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

        {/* Expert Info */}
        <section id="expert">
          <div className="container">
            <div className="kicker">Expert Info</div>

            <h2 className="section-title">전문가 소개</h2>
            <h3 className="kicker">
              각 분야 자격자가 한 팀으로 움직여 일정과 품질을 동시에 확보합니다.
            </h3>

            <div className="grid2">
              <div className="card expert-card">
                <div className="expert-head">
                  <div className="avatar" aria-hidden="true">
                    K
                  </div>
                  <h3>김명구 회계사</h3>
                </div>

                <p className="head">
                  공인회계사 · 세무사
                </p>
                <ul className="list">
                  <p className="muted m0">
                    약력 및 경력
                  </p>
                  <li>2008년공인회계사 시험 합격</li>
                  <li>2008년~2014년 아라타 감사법인<br></br>(현 PwC Japan 유한책임감사법인)</li>
                  <li>2014년공인회계사 등록</li>
                  <li>2014년김공인회계사사무소 설립</li>
                  <li>2015년세무사 등록</li>
                  <li>2015년김공인회계사·세무사사무소 설립</li>
                </ul>
                <ul className="list">
                  <p className="muted m0">
                    전문분야
                  </p>
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

                <p className="head">사법서사 행정서사</p>
                <ul className="list">
                  <p className="muted m0">
                    약력 및 경력
                  </p>
                  <li>2011년 오사카 체육대학 건강복지학부 졸업</li>
                  <li>2016년 한일을 연결하는 사법서사 사무소 근무</li>
                  <li>2023년 사법서기 시험 합격</li>
                  <li>2024년 히카리 사법서사 사무소 개업</li>
                  <li>2024년 행정서사 시험 합격</li>
                  <li>2025년 히카리 행정서사 사무소 개업</li>
                </ul>
                <ul className="list">
                  <p className="muted m0">
                    전문분야
                  </p>
                  <li>회사 설립</li>
                  <li>비자 취득</li>
                  <li>상속</li>
                  <li>부동산 매매</li>
                  <li>M&A</li>
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
