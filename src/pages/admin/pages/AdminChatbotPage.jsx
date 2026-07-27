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
      <div className="adm-portal-head">
        <div>
          <p className="adm-eyebrow">RAG Chatbot</p>
          <h2>운영 보조 AI</h2>
          <span>
            등록된 RAG 자료를 기준으로 상담, 문서, 일본 진출 관련 질문에 대한
            운영용 답변을 생성합니다.
          </span>
        </div>

        <div className="adm-portal-actions">
          <button type="button" className="adm-btn ghost" onClick={handleReset}>
            대화 초기화
          </button>
        </div>
      </div>

      <div className="adm-ai-layout">
        <section className="adm-card adm-ai-console">
          <div className="adm-card-head">
            <div>
              <p className="adm-eyebrow">Administrator Assistant</p>
              <h2>관리자 상담</h2>
              <span>질문에 관련된 자료가 있으면 함께 표시합니다.</span>
            </div>
          </div>

          <div className="adm-ai-window" ref={chatBodyRef}>
            {messages.map((message, index) => (
              <div key={index} className={`adm-ai-row ${message.type}`}>
                <div className="adm-ai-bubble">
                  <div className="adm-ai-text">{message.text}</div>

                  {message.sources?.length > 0 && (
                    <div className="adm-ai-sources">
                      <strong>참고 자료</strong>

                      {message.sources.map((source) => (
                        <div
                          key={`${source.fileId}-${source.chunkId}-${source.chunkIndex}`}
                          className="adm-ai-source"
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
              <div className="adm-ai-row bot">
                <div className="adm-ai-bubble loading">답변 생성 중...</div>
              </div>
            )}
          </div>

          <div className="adm-ai-bottom">
            {error && <p className="adm-chat-error">{error}</p>}

            <form className="adm-ai-form" onSubmit={handleSubmit}>
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

        <aside className="adm-ai-side">
          <section className="adm-card">
            <p className="adm-eyebrow">Knowledge Scope</p>
            <h3>응답 기준</h3>
            <div className="adm-guide-list">
              <div>
                <strong>RAG Prefix</strong>
                <span>normal 폴더의 통합 자료를 우선 검색합니다.</span>
              </div>
              <div>
                <strong>Match Count</strong>
                <span>질문과 가까운 청크 5개를 참고합니다.</span>
              </div>
              <div>
                <strong>운영 원칙</strong>
                <span>
                  법률·세무 사실은 자료 기반으로만 답변하도록 제한합니다.
                </span>
              </div>
            </div>
          </section>

          <section className="adm-card">
            <p className="adm-eyebrow">Usage</p>
            <h3>사용량</h3>
            {lastUsage ? (
              <div className="adm-token-list">
                <div>
                  <span>Prompt</span>
                  <strong>{lastUsage.prompt_tokens || 0}</strong>
                </div>
                <div>
                  <span>Completion</span>
                  <strong>{lastUsage.completion_tokens || 0}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{lastUsage.total_tokens || 0}</strong>
                </div>
              </div>
            ) : (
              <p className="adm-empty">아직 생성된 답변이 없습니다.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
