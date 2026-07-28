import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { sendQuestion } from "../../api/chatApi";
import Header from "../../components/Header";
import "./chat.css";

const DEFAULT_SYSTEM_PROMPT =
  "너는 CapsDol의 상담 보조 챗봇이다. 사용자가 다른 언어를 요청하지 않는 한 한국어로 답변한다. 답변은 명확하고 실무적으로 작성하며, 법률·판례·사실관계를 지어내지 않는다.";

export default function Chat() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "안녕하세요. CapsDol 상담 챗봇입니다. 질문을 입력해 주세요.",
      sources: [],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatBodyRef = useRef(null);
  const location = useLocation();
  const initialQuery = location.state?.initialQuery;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const message = textToSend.trim();

    if (!message || loading) return;

    setMessages((prev) => [...prev, { type: "user", text: message }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const data = await sendQuestion({
        message,
        ragPrefix: "normal",
        ragMatchCount: 5,
        system: DEFAULT_SYSTEM_PROMPT,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.answer || "답변을 생성하지 못했습니다.",
          sources: data.sources || [],
        },
      ]);

    } catch (err) {
      setError(err.message || "챗봇 응답 생성에 실패했습니다.");
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "죄송합니다. 현재 답변을 생성하지 못했습니다.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && isLoggedIn) {
      sendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, isLoggedIn]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([
      {
        type: "bot",
        text: "대화를 초기화했습니다. 새 질문을 입력해 주세요.",
        sources: [],
      },
    ]);
    setInput("");
    setError("");
  };

  if (isLoggedIn === null) {
    return <div>로딩 중...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <div className="ai-page">
        <main className="ai-main">
          <section className="ai-chat-intro">
            <div>
              <p>AI 상담 지원</p>
              <h1>일본 진출 상담 챗봇</h1>
              <span>
                법인 설립, 세무, 회계, 비자, 노무 관련 질문을 먼저 정리해
                보세요.
              </span>
            </div>
            <button
              type="button"
              className="ai-reset-top"
              onClick={handleReset}
            >
              대화 초기화
            </button>
          </section>

          <div className="ai-chat-workspace">
            <div className="ai-chat-column">
              <section className="ai-chat-panel" aria-label="상담 대화 내용">

            <div className="ai-chat-body" ref={chatBodyRef}>
              {messages.map((message, index) => (
                <div key={index} className={`ai-msg-row ${message.type}`}>
                  <div className="ai-bubble">
                    <div className="ai-bubble-text">{message.text}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ai-msg-row bot">
                  <div className="ai-bubble ai-typing">
                    답변 생성 중...
                  </div>
                </div>
              )}
            </div>

            <section className="ai-composer-panel" aria-label="질문 입력">
              {error && <p className="ai-chat-error">{error}</p>}

              <form className="ai-chat-input" onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="일본 법인 설립, 세무, 비자, 정관 작성에 대해 질문하세요..."
                  disabled={loading}
                />

                <button type="submit" disabled={loading || !input.trim()}>
                  {loading ? "생성 중" : "전송"} <span>→</span>
                </button>
              </form>
              <p className="ai-input-notice">
                AI 답변은 참고용이며, 최종 법률·세무 판단은 전문가와 확인해 주세요.
              </p>
            </section>
              </section>
            </div>

            <aside className="ai-context-panel">
            <div className="ai-context-card">
              <h3>자주 하는 질문</h3>
              {[
                "일본에 거주하지 않아도 법인을 설립할 수 있어?",
                "일본 법인 설립 전에 어떤 정보를 준비해야 해?",
                "정관 초안에서 가장 중요하게 봐야 할 부분은 뭐야?",
              ].map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="ai-next-steps">
              <h3>다음 단계</h3>
              <article className="ai-next-step-card">
                <h4>히어링 시트 작성</h4>
                <p>법인 설립과 상담에 필요한 기본 정보를 정리합니다.</p>
                <Link to="/hearing-sheet">히어링 시트 작성하기 <span>→</span></Link>
              </article>
              <article className="ai-next-step-card">
                <h4>전문가 상담 예약</h4>
                <p>AI로 정리한 내용을 바탕으로 담당 전문가와 상담 일정을 조율합니다.</p>
                <Link to="/reservation">상담 예약하기 <span>→</span></Link>
              </article>
            </div>

            <details className="ai-answer-policy">
              <summary>답변 기준 안내</summary>
              <p>
                챗봇은 등록된 RAG 문서를 참고해 답변합니다. 실제 법률·세무 판단은
                전문가 상담으로 최종 확인해야 합니다.
              </p>
            </details>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
