import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function App() {
  // Footer year
  const year = useMemo(() => new Date().getFullYear(), []);

  // FAQ open states (4개)
  const [faqOpen, setFaqOpen] = useState([false, false, false, false]);

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [context, setContext] = useState({
    track: null,
    hearing: {},
  });

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const chatBodyRef = useRef(null);
  const lastUserTextRef = useRef("");

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

    bot(
      "안녕하세요! WVA 상담 챗봇입니다. 원하시는 상담 유형을 알려주세요: <b>진출 설계/형태 결정</b> 또는 <b>운영/기장</b>.",
    );
    bot("원하시면 회사명 / 목표 / 일정도 함께 적어주세요.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  function toggleChat(open) {
    setChatOpen(open);
  }

  function openChatWithPreset(track) {
    setChatOpen(true);
    setContext((prev) => ({ ...prev, track }));
    bot(`좋아요. <b>${track}</b> 상담으로 진행할게요.`);
    askNext({ nextTrack: track });
  }

  function addMsg(htmlOrText, who) {
    setMessages((prev) => [...prev, { who, content: htmlOrText }]);
  }

  function bot(html) {
    addMsg(html, "bot");
  }

  function me(text) {
    lastUserTextRef.current = text;
    addMsg(escapeHtml(text), "me");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function askNext({ nextTrack } = {}) {
    setContext((prevCtx) => {
      const track = nextTrack ?? prevCtx.track;
      const hearing = { ...(prevCtx.hearing || {}) };

      if (!track) {
        bot(
          "상담 유형을 먼저 선택해 주세요: <b>진출 설계/형태 결정</b> / <b>운영/기장</b>",
        );
        return prevCtx;
      }

      // 1) company
      if (!hearing.company) {
        bot("1) 회사명(또는 프로젝트명)을 알려주세요.");
        hearing.company = "__pending__";
        return { track, hearing };
      }
      if (hearing.company === "__pending__") {
        const last = lastUserTextRef.current?.trim();
        if (last) hearing.company = last;
      }

      // 2) contact
      if (!hearing.contact) {
        bot("2) 담당자 연락처(메일/전화) 부탁드려요.");
        hearing.contact = "__pending__";
        return { track, hearing };
      }
      if (hearing.contact === "__pending__") {
        const last = lastUserTextRef.current?.trim();
        if (last) hearing.contact = last;
      }

      // 3) summary
      if (!hearing.summary) {
        if (track === "진출 설계/형태 결정") {
          bot(
            "3) 일본에서 하려는 일(판매/지사/채용/서비스 제공 등)과 목표 일정은요?",
          );
        } else {
          bot(
            "3) 현재 단계(설립 전/설립 완료/운영 중)와 월별 거래/증빙량(대략)을 알려주세요.",
          );
        }
        hearing.summary = "__pending__";
        return { track, hearing };
      }
      if (hearing.summary === "__pending__") {
        const last = lastUserTextRef.current?.trim();
        if (last) hearing.summary = last;
      }

      bot(
        `정리해드릴게요 ✅<br/>
        - 상담 유형: <b>${track}</b><br/>
        - 회사명: <b>${escapeHtml(hearing.company)}</b><br/>
        - 연락처: <b>${escapeHtml(hearing.contact)}</b><br/>
        - 내용: <b>${escapeHtml(hearing.summary)}</b><br/><br/>
        이 내용으로 상담 접수 진행할까요? (데모: “네”라고 입력)`,
      );

      return { track, hearing };
    });
  }

  function sendMsg() {
    const text = chatInput.trim();
    if (!text) return;

    me(text);
    setChatInput("");

    // 아주 단순한 intent parsing (원본과 동일 컨셉)
    setContext((prev) => {
      if (prev.track) return prev;
      let track = null;
      if (text.includes("진출") || text.includes("형태"))
        track = "진출 설계/형태 결정";
      else if (text.includes("기장") || text.includes("운영"))
        track = "운영/기장";
      if (!track) return prev;

      // track 잡히면 바로 다음 질문 흐름
      setTimeout(() => askNext({ nextTrack: track }), 0);
      return { ...prev, track };
    });

    // 질문 진행
    setTimeout(() => askNext(), 0);
  }

  function onHearingSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const company = form.company.value.trim();
    const contact = form.contact.value.trim();
    const goal = form.goal.value.trim();

    toggleChat(true);
    // preset + 메시지 전송(원본 UX)
    openChatWithPreset("진출 설계/형태 결정");
    me(`회사명: ${company}`);
    me(`연락처: ${contact}`);
    me(`목표: ${goal}`);

    setContext((prev) => ({
      track: "진출 설계/형태 결정",
      hearing: { company, contact, summary: goal },
    }));

    bot("폼 내용 확인했습니다. 위 내용 기준으로 1차 가이드를 정리해드릴게요.");
    bot(
      "추가로, 희망 일정(예: 3개월 내) / 예산 범위 / 예상 인력도 알려주시면 더 정확해요.",
    );

    form.reset();
  }

  return (
    <div className="App">
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
              <div className="kicker">한국 기업의 일본 현지 법인 설립 및 세무회계 고문</div>
              <h1 className="title">WVA</h1>
              <p className="subtitle">
                저희 회사는 이런 업무를 하고 이런 업무를 도와 일본 진출을 도와줄 수
                있습니다! 당신의 도약을 함께 하겠습니다!!!!
              </p>

              <div className="pill-row" aria-label="핵심 키워드">
              </div>
            </div>
            </div>
        </section>

        {/* Recommendation */}
        <section id="recommendation">
          <div className="container">
            <h2 className="section-title">이런 기업에게 추천합니다</h2>

            <div className="grid1">
              <div className="card">
                <h1>1</h1>
                <h2 className="muted">
                  일본에 진출하고자 하지만, 현지 법인 설립 절차가 복잡하게 느껴지는 기업
                </h2>
              </div>

              <div className="card">
                <h1>2</h1>
                <h2 className="muted">
                  회사 설립, 부동산 중개, 세무, 회계, 노무 등 종합적인 지원이 필요한 경우
                </h2>
              </div>

              <div className="card">
                <h1>3</h1>
                <h2 className="muted">
                  한국어로 상담부터 모든 과정이 진행되기를 원하는 기업
                </h2>
              </div>

              <div className="card">
                <h1>4</h1>
                <h2 className="muted">
                  일본 비즈니스 환경에 정통한 전문가의 컨설팅이 필요한 경우
                </h2>
              </div>

              <div className="card">
                <h1>5</h1>
                <h2 className="muted">
                  세무 리스크를 줄이고, 안정적인 일본 사업 운영을 원하시는 기업
                </h2>
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
                <h3>우리가 하는 일</h3>
                <p className="muted">
                  한국 기업의 일본 진출 과정에서 “복잡한 절차를 이해하기 쉽게”
                  정리하고, 실행 단계에서 필요한 준비물을 빠르게 맞추도록
                  돕습니다.
                </p>
              </div>

              <div className="card">
                <h3>작업 방식</h3>
                <ul className="list">
                  <li>상담 → 요구사항/목표 확인</li>
                  <li>히어링 시트 기반 정보 수집</li>
                  <li>진출 형태/일정/예산 가이드 제시</li>
                  <li>운영 단계 체크리스트 제공</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Hearing Sheet */}
        <section id="hearing">
          <div className="container">
            <div className="kicker">Hearing Sheet</div>
            <h2 className="section-title">히어링 시트</h2>

            <div className="grid">
              <div className="card">
                <h3>간단 입력</h3>
                <p className="muted">
                  아래 내용만 입력해도 1차 로드맵을 잡을 수 있어요.
                </p>

                <form id="hearingForm" onSubmit={onHearingSubmit}>
                  <div className="form-grid">
                    <input
                      className="btn input-like"
                      name="company"
                      placeholder="회사명"
                      required
                    />
                    <input
                      className="btn input-like"
                      name="contact"
                      placeholder="담당자 / 연락처(메일 or 전화)"
                      required
                    />
                    <input
                      className="btn input-like"
                      name="goal"
                      placeholder="일본 진출 목적(예: 판매, 지사, 채용 등)"
                      required
                    />
                    <button className="btn primary" type="submit">
                      챗봇으로 전달
                    </button>
                  </div>
                </form>

                <p className="notice">
                  * 제출 시 자동으로 챗봇에 내용이 전달됩니다(데모).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow">
          <div className="container">
            <div className="kicker">Flow</div>
            <h2 className="section-title">한국 기업의 일본 진출 흐름과 절차</h2>

            <div className="card">
              <ol className="list ol-tight">
                <li>
                  <b>목표/스코프 정의</b> (무엇을, 언제까지, 어느 규모로)
                </li>
                <li>
                  <b>진출 형태 선택</b> (지점/현지법인/자회사 등 비교)
                </li>
                <li>
                  <b>핵심 리스크 확인</b> (세무/노무/계약/지재권 등 큰 틀 체크)
                </li>
                <li>
                  <b>설립·초기 세팅</b> (계좌/필수 등록/기본 운영 체계)
                </li>
                <li>
                  <b>운영 루틴 구축</b> (월별 증빙/기장 준비/보고 체계)
                </li>
                <li>
                  <b>지속 개선</b> (비용 구조, 절차 자동화, 내부 통제 강화)
                </li>
              </ol>
              <p className="notice">
                * 위 단계는 “대략적인 흐름”입니다. 업종/규모/형태에 따라 필요한
                신고·서류가 달라질 수 있어요. (회계/법무 전문가 확인 권장)
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="container">
            <div className="kicker">FAQ</div>
            <h2 className="section-title">FAQ</h2>

            <div className="grid">
              {[
                {
                  q: "1) 상담은 무료인가요?",
                  a: "1차 방향성/체크리스트 수준의 간단 상담은 무료로 안내하고, 실제 실행/대행 범위는 케이스에 따라 안내합니다(데모 문구).",
                },
                {
                  q: "2) 어떤 자료를 준비해야 하나요?",
                  a: "회사 기본정보, 일본 진출 목적/일정, 예상 인력/예산, 거래 구조(판매/수출/현지 운영 등) 정도면 시작 가능합니다.",
                },
                {
                  q: "3) 형태(지점/법인/자회사)는 어떻게 결정하나요?",
                  a: "비용·세금·리스크·운영 난이도·향후 확장 계획을 기준으로 비교표를 만들고, 우선순위에 맞춰 추천안을 제시합니다.",
                },
                {
                  q: "4) 일본어 대응/커뮤니케이션도 지원하나요?",
                  a: "필요한 범위에서 커뮤니케이션을 정리하고(질문 리스트/메일 초안/요구사항 정리), 업무 진행이 막히지 않게 돕습니다.",
                },
              ].map((item, idx) => (
                <div className="faq-item" key={idx}>
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
                <p className="notice">
                  * 현재는 데모 챗봇입니다. 실제로는 상담 폼/CRM/슬랙 연동
                  등으로 확장 가능.
                </p>
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
                if (e.key === "Enter") sendMsg();
              }}
              placeholder="메시지를 입력하세요 (예: 진출 설계 문의)"
              autoComplete="off"
            />
            <button className="btn primary" onClick={sendMsg}>
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
