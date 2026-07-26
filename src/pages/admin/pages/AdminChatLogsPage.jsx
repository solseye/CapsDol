import { useEffect, useMemo, useState } from "react";
import { getAdminChatLogs } from "../../../api/chatLogApi";
import "../admin.css";

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR");
}

export default function AdminChatLogsPage() {
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("local");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminChatLogs({ keyword });

      setLogs(data.logs || []);
      setSource(data.source || "local");
    } catch (err) {
      setError(err.message || "채팅 기록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) return logs;

    return logs.filter((log) => {
      const targetText = [log.username, log.email, log.message, log.answer]
        .join(" ")
        .toLowerCase();

      return targetText.includes(normalizedKeyword);
    });
  }, [keyword, logs]);

  return (
    <div className="adm-page">
      <div className="adm-portal-head">
        <div>
          <p className="adm-eyebrow">Chat Logs</p>
          <h2>사용자 질문 기록</h2>
          <span>사용자가 챗봇에 남긴 질문과 AI 답변을 확인합니다.</span>
        </div>

        <button
          type="button"
          className="adm-btn ghost"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          {isLoading ? "조회 중..." : "새로고침"}
        </button>
      </div>

      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h2>기록 검색</h2>
            <span>
              {source === "server"
                ? "서버 DB 기록을 조회 중입니다."
                : "아직 서버 API가 없어 이 브라우저에 저장된 임시 기록을 표시합니다."}
            </span>
          </div>
        </div>

        <div className="admin-chat-log-filter">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="사용자, 이메일, 질문, 답변 검색"
          />

          <button type="button" className="adm-btn primary" onClick={fetchLogs}>
            검색
          </button>
        </div>
      </section>

      {error && <section className="adm-card admin-alert error">{error}</section>}

      <section className="adm-card">
        <div className="adm-card-head">
          <h2>질문/답변 목록 {filteredLogs.length}건</h2>
        </div>

        {isLoading ? (
          <div className="adm-empty">채팅 기록을 불러오는 중입니다.</div>
        ) : filteredLogs.length === 0 ? (
          <div className="adm-empty">표시할 채팅 기록이 없습니다.</div>
        ) : (
          <div className="admin-chat-log-list">
            {filteredLogs.map((log) => (
              <article className="admin-chat-log-card" key={log.id}>
                <div className="admin-chat-log-meta">
                  <strong>{log.username || "사용자"}</strong>
                  <span>{log.email || "이메일 없음"}</span>
                  <small>{formatDate(log.created_at)}</small>
                </div>

                <div className="admin-chat-log-body">
                  <div>
                    <span>질문</span>
                    <p>{log.message}</p>
                  </div>

                  <div>
                    <span>답변</span>
                    <p>{log.answer || "저장된 답변이 없습니다."}</p>
                  </div>
                </div>

                {log.sources?.length > 0 && (
                  <div className="admin-chat-log-sources">
                    참고 자료 {log.sources.length}개
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
