import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { sendQuestion } from "../../api/chatApi";
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
    <div className="layout">
      <Header isLoggedIn={isLoggedIn} />

      <div className="chat-container">
        <div className="chat-inner">

          <section className="chat card">
            <div className="chat-top">
              <div>
                <p className="kicker">Chatbot</p>
                <h2>상담</h2>
              </div>

              <button
                type="button"
                className="chat-reset-btn"
                onClick={handleReset}
              >
                대화 초기화
              </button>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              {messages.map((message, index) => (
                <div key={index} className={`msg-row ${message.type}`}>
                  <div className="bubble">
                    <div className="bubble-text">{message.text}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-row bot">
                  <div className="bubble typing">답변 생성 중...</div>
                </div>
              )}
            </div>

            <div className="chat-bottom">
              {error && <p className="chat-error">{error}</p>}

              <form className="chat-input" onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="상담 관련 질문을 입력하세요..."
                  disabled={loading}
                />

                <button type="submit" disabled={loading || !input.trim()}>
                  {loading ? "생성 중" : "전송"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}