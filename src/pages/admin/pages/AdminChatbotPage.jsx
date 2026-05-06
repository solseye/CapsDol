import { useState } from "react";
import AdminButton from "../components/AdminButton";
import AdminCard from "../components/AdminCard";
import { mockPdfs } from "../mockData";

export default function AdminChatbotPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "관리자용 챗봇입니다. 등록된 PDF 자료를 기준으로 질문을 테스트해 보세요.",
    },
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setError("");
    setIsLoading(true);

    // 기존 mock 답변 추가 방식입니다.
    // setMessages((prev) => [
    //   ...prev,
    //   { role: "user", text },
    //   {
    //     role: "bot",
    //     text: `"${text}"에 대한 mock 답변입니다. 실제 백엔드 연결 전 UI 확인용입니다.`,
    //   },
    // ]);
    // setInput("");

    // 변경 이유: 실제 백엔드 연결 전에도 챗봇 요청 중/응답 완료/에러 상태 UI를 확인할 수 있게 합니다.
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);
    setInput("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `"${text}"에 대한 mock 답변입니다. 실제 백엔드 연결 전 UI 확인용입니다.`,
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Chatbot Test</p>
          <h2>관리자 챗봇</h2>
          <span>챗봇 답변 흐름을 관리자 화면에서 테스트합니다.</span>
        </div>
      </div>

      <div className="adm-chat-layout">
        <AdminCard title="챗봇 테스트" className="adm-chat-card">
          <div className="adm-chat-window">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`adm-message ${message.role}`}>
                {message.text}
              </div>
            ))}
            {isLoading && <div className="adm-message bot loading">답변 생성 중...</div>}
          </div>

          {error && <div className="adm-chat-error">{error}</div>}

          <form className="adm-chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="질문을 입력하세요"
              disabled={isLoading}
            />
            <AdminButton type="submit" disabled={isLoading}>
              {isLoading ? "대기" : "전송"}
            </AdminButton>
          </form>
        </AdminCard>

        <AdminCard title="자료 상태">
          <div className="adm-stat-card">
            <span>사용 중인 PDF 자료</span>
            <strong>{mockPdfs.length}</strong>
            <p>등록된 mock PDF 자료 기준입니다.</p>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
