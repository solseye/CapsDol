import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { sendQuestion } from "../../api/chatApi";
import { auth } from "../../firebase";
import "./chat.css";

export default function Chat() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [messages, setMessages] = useState([
    { type: "bot", text: "안녕하세요. 무엇을 도와드릴까요?" }
  ]);

  const [input, setInput] = useState("");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;

    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendQuestion(userText);

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.success ? data.answer : "응답 실패" }
      ]);
    } catch {
      setMessages((prev) => [...prev, { type: "bot", text: "서버 오류" }]);
    }

    setLoading(false);
  }

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
          <div className="summary">
            <h3>주요 채팅 요약</h3>
            <div className="summary-content">내용내용</div>
          </div>

          <div className="chat">
            <div className="chat-body" ref={chatBodyRef}>
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.type}`}>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}

              {loading && (
                <div className="msg-row bot">
                  <div className="bubble typing">답변 생성중</div>
                </div>
              )}
            </div>

            <div className="chat-bottom">
              <div className="chat-action-bar">
                {["세무", "법무", "비자", "행정"].map((b, i) => (
                  <button
                    key={i}
                    className={active === i ? "active" : ""}
                    onClick={() => setActive(i)}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <form className="chat-input" onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                />
                <button type="submit">전송</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}