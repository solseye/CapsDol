import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function MainPage() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (!chatOpen) return;
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, chatOpen]);

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

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;

    addMsg(text, "me");
    setChatInput("");

    setTimeout(() => {
      bot(
        "문의 내용을 확인했습니다. 상담 담당자가 검토할 수 있도록 정리해드리겠습니다.",
      );
    }, 300);
  }

  return (
    <div className="App">
      <div id="top"></div>

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
              <li>
                <Link to="/hearing-sheet" className="btn nav-cta">
                  히어링시트
                </Link>
              </li>
              <li>
                <a href="#consult" className="btn primary nav-cta">
                  상담 신청(챗봇)
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="kicker">
                한국 기업의 일본 현지 법인 설립 및 세무회계 고문
              </div>
              <h1 className="title">WVA</h1>
              <p className="subtitle">
                일본 진출 예정 또는 이미 진출한 한국 기업을 지원합니다.
                <br />
                일본 현지법인 설립부터 세무·회계, 비자 취득 등의 절차 및 이후
                사업 운영 전반까지 고민을 해소해 드립니다.
              </p>

              <div className="pill-row" aria-label="핵심 키워드">
                <span className="pill">법인 설립</span>
                <span className="pill">세무/회계</span>
                <span className="pill">비자 발행</span>
                <span className="pill">계좌 개설</span>
                <span className="pill">노무 관리</span>
              </div>
            </div>
          </div>
        </section>

        <section id="recommendation">
          <div className="container">
            <h2 className="rec-title">이런 기업에게 추천합니다</h2>

            <div className="grid">
              {[
                "일본에 진출하고자 하지만, 현지 법인 설립 절차가 복잡하게 느껴지는 기업",
                "회사 설립, 부동산 중개, 세무, 회계, 노무 등 종합적인 지원이 필요한 경우",
                "한국어로 상담부터 모든 과정이 진행되기를 원하는 기업",
                "일본 비즈니스 환경에 정통한 전문가의 컨설팅이 필요한 경우",
                "세무 리스크를 줄이고, 안정적인 일본 사업 운영을 원하시는 기업",
              ].map((text, idx) => (
                <div className="card rec-card" key={idx}>
                  <div className="rec-num">{idx + 1}</div>
                  <h3 className="muted">{text}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  <li>한국계 은행을 중심으로 법인 계좌 개설 지원</li>
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

        <section id="about">
          <div className="container">
            <div className="kicker">Company</div>
            <h2 className="section-title">회사 개요</h2>

            <div className="grid2">
              <div className="card">
                <h3>회사에서 제공하는 서비스</h3>
                <p className="muted">
                  한국 기업의 일본 진출 과정에서 복잡한 절차를 이해하기 쉽게
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

        <section id="faq">
          <div className="container">
            <div className="kicker">FAQ</div>
            <h2 className="faq-title">자주 묻는 질문</h2>

            <div className="grid">
              {[
                {
                  q: "비거주자도 회사를 설립할 수 있나요?",
                  a: "네, 일반적으로 대표가 일본 비거주자여도 회사 설립 절차를 진행할 수 있습니다.",
                },
                {
                  q: "자본금은 많은 것이 좋은가요?",
                  a: "사업 형태와 세무상 구조에 따라 달라질 수 있어, 상황에 맞는 설계가 중요합니다.",
                },
                {
                  q: "회사 설립 후 어떤 절차가 필요한가요?",
                  a: "세무서 및 지방자치단체 신고, 사회보험 및 노동보험 관련 절차 등이 필요합니다.",
                },
                {
                  q: "한국 본사와 일본 자회사 거래 시 유의점은?",
                  a: "이전가격 리스크를 검토해야 하며, 적정 거래가격 설정이 중요합니다.",
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
              일본 진출을 이해하기 쉽게 설명하고, 실행을 막히지 않게 돕습니다.
            </div>
            <div className="muted footer-right">
              © {year} WVA. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

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
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="메시지를 입력하세요"
              autoComplete="off"
            />
            <button className="btn primary" onClick={sendMessage}>
              전송
            </button>
          </div>
        </div>
      )}

      <div className="chat-fab">
        <button className="btn primary" onClick={() => toggleChat(true)}>
          상담(챗봇)
        </button>
      </div>
    </div>
  );
}
