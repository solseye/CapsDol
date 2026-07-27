import "../App.css";
import "../styles/auth-visily.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findPassword } from "../api/authApi";

export default function LostPw() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("아이디를 입력해 주세요.");
      setMessage("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      const data = await findPassword(username.trim());

      setMessage(
        data.msg ||
          "해당 아이디에 연결된 이메일로 비밀번호 재설정 링크를 발송했습니다."
      );
    } catch (err) {
      setError(err.message || "비밀번호 찾기 요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="authv-page">
      <section className="authv-brand-panel">
        <button
          type="button"
          className="authv-brand"
          onClick={() => navigate("/")}
          aria-label="WVA 홈으로 이동"
        >
          <span>◎</span>
          <strong>WVA AI Consulting</strong>
        </button>

        <div className="authv-brand-copy">
          <h1>
            비밀번호를 잊어도
            <span>업무는 이어집니다</span>
          </h1>
          <p>
            아이디를 입력하면 연결된 이메일로 비밀번호 재설정 링크를 보내
            계정 접근을 복구합니다.
          </p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>메일 기반 재설정</strong>
              <p>계정에 연결된 이메일로 재설정 링크를 발송합니다.</p>
            </div>
            <div>
              <span>✓</span>
              <strong>보안 흐름 유지</strong>
              <p>새 비밀번호 설정 후 기존 업무 페이지로 복귀할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">일본 진출 운영 시스템의 안전한 계정 복구</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>비밀번호 찾기</h2>
            <p>
              아이디를 입력하면 해당 계정에 연결된 이메일로 비밀번호 재설정
              링크를 보내드립니다.
            </p>
          </div>

          <div className="authv-divider">
            <span>재설정 링크 요청</span>
          </div>

          <form className="authv-form" onSubmit={handleSubmit}>
            <div className="authv-field">
              <label htmlFor="username">아이디</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                  setMessage("");
                }}
                autoComplete="username"
              />
            </div>

            {error && <p className="authv-error">{error}</p>}
            {message && <p className="authv-success">{message}</p>}

            <button
              type="submit"
              className="authv-submit"
              disabled={isLoading}
            >
              {isLoading ? "발송 중..." : "비밀번호 재설정 링크 받기"} <span>→</span>
            </button>
          </form>

          <div className="authv-help">
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              로그인으로 돌아가기
            </button>

            <span>또는</span>

            <button
              type="button"
              onClick={() => navigate("/lostid")}
            >
              아이디 찾기
            </button>
          </div>

          <div className="authv-compliance">
            <span>계정 복구</span>
            <span>메일 인증 흐름</span>
            <span>업무 복귀 지원</span>
          </div>
        </div>
      </section>
    </div>
  );
}
