import { useEffect, useRef, useState } from "react";
import { sendQuestion } from "../../../api/chatApi";
import "../admin.css";
import "../../Chat/chat.css";

const DEFAULT_SYSTEM_PROMPT =
  "너는 CapsDol의 관리자 상담 보조 챗봇이다. 사용자가 다른 언어를 요청하지 않는 한 한국어로 답변한다. 답변은 명확하고 실무적으로 작성하며, 법률·판례·사실관계를 지어내지 않는다.";

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "안녕하세요. CapsDol 관리자 상담 챗봇입니다. 질문을 입력해 주세요.",
      sources: [],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUsage, setLastUsage] = useState(null);
  const [error, setError] = useState("");

  const chatBodyRef = useRef(null);

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

      setLastUsage(data.usage || null);
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
    setLastUsage(null);
    setError("");
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">RAG Chatbot</p>
          <h2>관리자 상담 챗봇</h2>
          <span>등록된 RAG 자료를 기준으로 상담 답변을 생성합니다.</span>
        </div>
      </div>

      <div className="chat-container admin-chat-container">
        <div className="chat-inner">
          <aside className="summary card">
            <p className="kicker">RAG Chatbot</p>
            <h3>관리자 상담 챗봇</h3>

            <div className="summary-content">
              등록된 상담 자료를 기준으로 답변합니다.
              <br />
              답변은 참고용이며, 중요한 법률·세무 판단은 전문가 검토가
              필요합니다.
            </div>

            {lastUsage && (
              <div className="chat-meta-box">
                <span>사용 토큰</span>
                <strong>{lastUsage.total_tokens || 0}</strong>
              </div>
            )}
          </aside>

          <section className="chat card">
            <div className="chat-top">
              <div>
                <p className="kicker">Administrator Assistant</p>
                <h2>관리자 상담</h2>
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

                    {message.sources?.length > 0 && (
                      <div className="source-list">
                        <strong>참고 자료</strong>

                        {message.sources.map((source) => (
                          <div
                            key={`${source.fileId}-${source.chunkId}-${source.chunkIndex}`}
                            className="source-item"
                          >
                            <span>
                              {source.sourceName ||
                                source.originalName ||
                                source.storagePath}
                            </span>
                            <small>
                              유사도{" "}
                              {typeof source.similarity === "number"
                                ? source.similarity.toFixed(3)
                                : "-"}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
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
    </div>
  );
}