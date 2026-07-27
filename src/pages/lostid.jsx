import "../App.css";
import "../styles/auth-visily.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findId } from "../api/authApi";

export default function LostId() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("가입 시 사용한 이메일을 입력해 주세요.");
      setMessage("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      const data = await findId(email.trim());
      console.log("응답 데이터:", data);

      setMessage(
        data.uid
          ? `가입된 아이디는 ${data.uid} 입니다.`
          : data.msg || "아이디를 찾을 수 없습니다."
      );
    } catch (err) {
      setError(err.message || "아이디 찾기에 실패했습니다.");
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
            계정 정보를
            <span>안전하게 확인하세요</span>
          </h1>
          <p>
            가입 시 사용한 이메일을 기준으로 WVA 계정 아이디를 확인할 수
            있습니다.
          </p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>이메일 기반 확인</strong>
              <p>가입 정보와 연결된 이메일로 계정을 찾습니다.</p>
            </div>
            <div>
              <span>✓</span>
              <strong>업무 흐름 복귀</strong>
              <p>계정 확인 후 히어링 시트와 상담 예약을 이어갈 수 있습니다.</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">일본 진출 업무를 이어가기 위한 계정 복구</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>아이디 찾기</h2>
            <p>가입 시 등록한 이메일을 입력하면 아이디를 확인할 수 있습니다.</p>
          </div>

          <div className="authv-divider">
            <span>계정 이메일 확인</span>
          </div>

          <form className="authv-form" onSubmit={handleSubmit}>
            <div className="authv-field">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setMessage("");
                }}
                autoComplete="email"
              />
            </div>

            {error && <p className="authv-error">{error}</p>}
            {message && <p className="authv-success">{message}</p>}

            <button
              type="submit"
              className="authv-submit"
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "아이디 찾기"} <span>→</span>
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
              onClick={() => navigate("/lostpw")}
            >
              비밀번호 찾기
            </button>
          </div>

          <div className="authv-compliance">
            <span>계정 복구</span>
            <span>문서 작업 연결</span>
            <span>전문가 상담 지원</span>
          </div>
        </div>
      </section>
    </div>
  );
}
