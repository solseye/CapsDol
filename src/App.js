import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

/** ✅ 히어링 시트 페이지 */
function HearingPage() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const navigate = useNavigate();

  // 히어링 폼 상태
  const [hearing, setHearing] = useState({
    company: "",
    contact: "",
    goal: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setHearing((prev) => ({ ...prev, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();

    // TODO: 여기서 실제로 서버/DB/슬랙/메일 연동하면 됨
    alert(
      `제출 완료!\n회사명: ${hearing.company}\n연락처: ${hearing.contact}\n진출 목적: ${hearing.goal}`,
    );

    // 제출 후 메인으로 이동(원하면 제거 가능)
    navigate("/");
  }

  return (
    <div className="App">
      <div id="top"></div>

      {/* Header (기존 디자인 유지) */}
      <header>
        <div className="container nav">
          <Link className="brand" to="/">
            <span className="logo" aria-hidden="true" />
            <span>WVA</span>
          </Link>

          <nav aria-label="주요 메뉴">
            <ul>
              <li>
                <Link to="/" className="btn primary nav-cta">
                  메인으로
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section id="HearingSheet">
          <div className="container">
            <div className="kicker">Hearing Sheet</div>
            <h2 className="section-title">히어링 시트</h2>

            <div className="grid">
              <div className="card">
                <h3>간단 입력</h3>
                <p className="muted">
                  아래 내용만 입력해도 1차 로드맵을 잡을 수 있어요.
                </p>

                <form id="hearingForm" onSubmit={onSubmit}>
                  <div className="form-grid">
                    <input
                      className="btn input-like"
                      name="company"
                      placeholder="회사명"
                      required
                      value={hearing.company}
                      onChange={onChange}
                    />
                    <input
                      className="btn input-like"
                      name="contact"
                      placeholder="담당자 / 연락처(메일 or 전화)"
                      required
                      value={hearing.contact}
                      onChange={onChange}
                    />
                    <input
                      className="btn input-like"
                      name="goal"
                      placeholder="일본 진출 목적(예: 판매, 지사, 채용 등)"
                      required
                      value={hearing.goal}
                      onChange={onChange}
                    />
                    <button className="btn primary" type="submit">
                      제출
                    </button>
                  </div>
                </form>

                <p className="notice">* 제출 시 상담을 위해 연락드립니다.</p>

                <button
                  className="btn"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  ← 메인으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="container footer-grid">
            <div className="muted footer-left">
              <b className="footer-brand">WVA</b>
              <br />
              일본 진출을 “이해하기 쉽게” 설명하고, 실행을 “막히지 않게”
              돕습니다.
            </div>
            <div className="muted footer-right">
              © {year} WVA. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/** ✅ 메인 페이지 (네 기존 App.js 내용) */
function MainPage() {
  // Footer year
  const year = useMemo(() => new Date().getFullYear(), []);

  // FAQ open states (4개)
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const chatBodyRef = useRef(null);

  // 스크롤 자동 하단
  useEffect(() => {
    if (!chatOpen) return;
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, chatOpen]);

  // 챗 열 때 첫 메시지
  useEffect(() => {
    if (!chatOpen) return;
    if (messages.length > 0) return;

    bot("안녕하세요! WVA 상담 챗봇입니다.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  function toggleChat(open) {
    setChatOpen(open);
  }

  function addMsg(htmlOrText, who) {
    setMessages((prev) => [...prev, { who, content: htmlOrText }]);
  }

  function bot(html) {
    addMsg(html, "bot");
  }

  // ✅ 기존 코드 Enter 버그 최소 수정 (세미콜론 제거 + 전송 로직)
  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    addMsg(text, "user");
    setChatInput("");
    bot("문의 감사합니다! 담당자가 확인 후 안내드릴게요. (데모)");
  }

  return (
    <div className="App">
      <div id="top"></div>

      {/* Header */}
      <header>
        <div className="container nav">
          <a className="brand" href="#top">
            <span className="logo" aria-hidden="true" />
            <span>WVA</span>
          </a>

          <nav aria-label="주요 메뉴">
            <ul>
              <li>
                <a href="#service">서비스</a>
              </li>
              <li>
                <a href="#about">회사 개요</a>
              </li>
              <li>
                <a href="#flow">업무 흐름</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>

              {/* ✅ 여기만 바꿈: #HearingSheet 앵커가 아니라 /hearing 라우팅으로 */}
              <li>
                <Link to="/hearing" className="btn primary nav-cta">
                  히어링시트 작성
                </Link>
              </li>

              <li>
                <a href="#consult" className="btn primary nav-cta">
                  상담 신청 (챗봇)
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

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

        {/* 이하 네 기존 코드 그대로… (Recommendation/Service/About/Flow/FAQ/Consult/Company/Footer) */}
        {/* 너 코드 그대로 붙여도 되는데, 여기서는 길어서 생략하지 않고 그대로 유지해야 함 */}
        {/* === 여기부터 아래는 너가 올린 코드 그대로 붙이면 됨 === */}

        {/* Recommendation */}
        <section id="recommendation">
          <div className="container">
            <h2 className="rec-title">이런 기업에게 추천합니다</h2>

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

        {/* FAQ */}
        <section id="faq">
          <div className="container">
            <div className="kicker">FAQ</div>
            <h2 className="faq-title">자주 묻는 질문</h2>

            <div className="grid">
              {[
                {
                  q: "비거주자(일본에 거주하지 않는 사람)도 회사를 설립할 수 있나요?",
                  a: "네, 보통 법인을 설립할 때는 대표가 일본 비거주자여도 회사설립 절차를 진행할 수 있습니다. 단, 일본 지점을 설립할 경우에는 대표자(일본 책임자)가 반드시 일본 거주자여야 합니다.",
                },
                {
                  q: "자본금은 많은 것이 좋나요, 적은 것이 좋나요?",
                  a: "예를 들어, 자본금이 1,000만 엔 이상인지 미만인지에 따라 처음 2년간 소비세 면세사업자로 인정받을 수 있는지 여부가 달라지고, 자본금이 1억 엔 이상인지 미만인지에 따라 외형표준과세 적용 여부도 달라집니다. 이처럼 자본금의 규모에 따라 여러 가지 차이가 생길 수 있으니 주의가 필요합니다. 반면, 초기 단계에서 많은 자금이 필요한 사업이라면 그에 걸맞은 자본금이 필요하다고 볼 수 있습니다.",
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

        {/* Consult */}
        <section id="consult">
          <div className="container">
            <div className="kicker">Consult</div>
            <h2 className="section-title">상담 신청</h2>

            <div className="grid">
              <div className="card">
                <h3>챗봇으로 바로 상담</h3>
                <p className="muted">
                  우측 하단 챗봇 버튼을 누르거나, 아래 버튼을 눌러 상담을
                  시작하세요.
                </p>
                <button
                  className="btn primary"
                  onClick={() => toggleChat(true)}
                >
                  상담 시작하기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section id="company">
          <div className="container">
            <div className="kicker">Company Info</div>
            <h2 className="section-title">회사 정보</h2>

            <div className="card company-card">
              <h3>대표</h3>
              <p className="muted m0">최옥종</p>

              <div className="spacer" />

              <h3>위치</h3>
              <p className="muted m0">Osaka Nishinari</p>

              <div className="spacer" />

              <h3>연락처</h3>
              <p className="muted m0">E-mail Address</p>
            </div>
          </div>
        </section>

        <footer>
          <div className="container footer-grid">
            <div className="muted footer-left">
              <b className="footer-brand">WVA</b>
              <br />
              일본 진출을 “이해하기 쉽게” 설명하고, 실행을 “막히지 않게”
              돕습니다.
            </div>
            <div className="muted footer-right">
              © {year} WVA. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

      {/* Chatbot Panel */}
      {chatOpen && (
        <div className="chat-panel" role="dialog" aria-label="상담 챗봇">
          <div className="chat-head">
            <div>
              <div className="chat-title">상담 챗봇</div>
              <div className="muted chat-subtitle">
                데모: 기본 질문 → 요약 → 상담 신청
              </div>
            </div>
            <button className="btn" onClick={() => toggleChat(false)}>
              닫기
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`msg ${m.who}`}
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
            ))}
          </div>

          <div className="chat-input">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChat();
              }}
              placeholder="메시지를 입력하세요 (예: 진출 설계 문의)"
              autoComplete="off"
            />
            <button className="btn primary" onClick={sendChat}>
              전송
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Floating Button */}
      <div className="chat-fab">
        <button className="btn primary" onClick={() => toggleChat(true)}>
          상담(챗봇)
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/hearing" element={<HearingPage />} />
    </Routes>
  );
}
