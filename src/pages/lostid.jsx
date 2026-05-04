import "../App.css";
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
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card card">
          <div className="kicker">Find Account</div>

          <h1 className="section-title login-title">아이디 찾기</h1>

          <p className="section-desc login-desc">
            가입 시 등록한 이메일을 입력하면 아이디를 확인할 수 있습니다.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                이메일
              </label>
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
                className="reservation-input"
                autoComplete="email"
              />
            </div>

            {error && <p className="login-error">{error}</p>}
            {message && <p className="login-success">{message}</p>}

            <button
              type="submit"
              className="btn primary login-submit"
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "아이디 찾기"}
            </button>
          </form>

          <div className="signup-redirect">
            <button
              type="button"
              className="signup-link"
              onClick={() => navigate("/login")}
            >
              로그인으로 돌아가기
            </button>
            <span className="auth-link-divider">|</span>
            <button
              type="button"
              className="signup-link"
              onClick={() => navigate("/lostpw")}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}