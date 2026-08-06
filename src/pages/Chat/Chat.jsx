import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { getChatHistory, sendQuestion } from "../../api/chatApi";
import FormattedChatText from "../../components/FormattedChatText";
import { getCurrentLanguage, translate } from "../../i18n/translations";
import { getPageCopy } from "../../i18n/pageCopy";
import "./chat.css";

export default function Chat() {
  const copy = getPageCopy("chat");
  const language = getCurrentLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: copy.greeting,
      sources: [],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyReady, setHistoryReady] = useState(false);

  const chatBodyRef = useRef(null);
  const initialQuerySentRef = useRef(false);
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

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let cancelled = false;

    const loadRecentHistory = async () => {
      try {
        const data = await getChatHistory({ limit: 5, offset: 0 });
        if (cancelled) return;

        const histories = Array.isArray(data.histories)
          ? data.histories
          : [];
        const recentMessages = histories
          .slice()
          .reverse()
          .flatMap((history) => {
            const restoredMessages = [];

            if (history.question) {
              restoredMessages.push({
                type: "user",
                text: history.question,
              });
            }

            if (history.answer) {
              restoredMessages.push({
                type: "bot",
                text: history.answer,
                sources: Array.isArray(history.sources) ? history.sources : [],
              });
            }

            return restoredMessages;
          });

        if (recentMessages.length > 0) {
          setMessages(recentMessages);
        }
      } catch (historyError) {
        console.error("최근 챗봇 대화 기록 조회 실패:", historyError);
      } finally {
        if (!cancelled) setHistoryReady(true);
      }
    };

    loadRecentHistory();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

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
        system: copy.system,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.answer || copy.answerFallback,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      setError(err.message || copy.error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: copy.apology,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      initialQuery &&
      isLoggedIn &&
      historyReady &&
      !initialQuerySentRef.current
    ) {
      initialQuerySentRef.current = true;
      sendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, isLoggedIn, historyReady]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([
      {
        type: "bot",
        text: copy.resetMessage,
        sources: [],
      },
    ]);
    setInput("");
    setError("");
  };

  if (isLoggedIn === null) {
    return <div>{translate(language, "common.loading")}</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="ai-page">
        <main className="ai-main">
          <section className="ai-chat-intro">
            <div>
              <p>{copy.kicker}</p>
              <h1>{copy.title}</h1>
              <span>{copy.intro}</span>
            </div>
            <button
              type="button"
              className="ai-reset-top"
              onClick={handleReset}
              disabled={loading || !historyReady}
            >
              {copy.reset}
            </button>
          </section>

          <div className="ai-chat-workspace">
            <div className="ai-chat-column">
              <section className="ai-chat-panel" aria-label={copy.conversation}>
                <div className="ai-chat-body" ref={chatBodyRef}>
                  {messages.map((message, index) => (
                    <div key={index} className={`ai-msg-row ${message.type}`}>
                      <div className="ai-bubble">
                        <div className="ai-bubble-text">
                          {message.type === "bot" ? (
                            <FormattedChatText text={message.text} />
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!historyReady && (
                    <div className="ai-msg-row bot">
                      <div className="ai-bubble ai-typing">
                        {translate(language, "common.loading")}
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="ai-msg-row bot">
                      <div className="ai-bubble ai-typing">
                        {copy.generating}
                      </div>
                    </div>
                  )}
                </div>

                <section
                  className="ai-composer-panel"
                  aria-label={copy.inputLabel}
                >
                  {error && <p className="ai-chat-error">{error}</p>}

                  <form className="ai-chat-input" onSubmit={handleSubmit}>
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={copy.placeholder}
                      disabled={loading || !historyReady}
                    />

                    <button
                      type="submit"
                      disabled={loading || !historyReady || !input.trim()}
                    >
                      {loading ? copy.generating : copy.send} <span>→</span>
                    </button>
                  </form>
                  <p className="ai-input-notice">{copy.notice}</p>
                </section>
              </section>
            </div>

            <aside className="ai-context-panel">
              <div className="ai-context-card ai-context-hub">
                <section className="ai-context-section ai-faq-section">
                  <h3>{copy.faqTitle}</h3>
                  <div className="ai-faq-list">
                    {copy.questions.map((question) => (
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
                </section>

                <section className="ai-context-section ai-next-steps">
                  <h3>{copy.next}</h3>
                  <div className="ai-next-step-list">
                    <article className="ai-next-step-card">
                      <h4>{copy.hearingTitle}</h4>
                      <p>{copy.hearingBody}</p>
                      <Link to="/hearing-sheet">
                        {copy.hearingCta} <span>→</span>
                      </Link>
                    </article>
                    <article className="ai-next-step-card">
                      <h4>{copy.consultTitle}</h4>
                      <p>{copy.consultBody}</p>
                      <Link to="/reservation">
                        {copy.consultCta} <span>→</span>
                      </Link>
                    </article>
                  </div>
                </section>
              </div>

              <details className="ai-answer-policy">
                <summary>{copy.policyTitle}</summary>
                <p>{copy.policyBody}</p>
              </details>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
