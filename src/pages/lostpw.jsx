import "../App.css";
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
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card card">
          <div className="kicker">Reset Password</div>

          <h1 className="section-title login-title">비밀번호 찾기</h1>

          <p className="section-desc login-desc">
            아이디를 입력하면 해당 계정에 연결된 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="username">
                아이디
              </label>
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
                className="reservation-input"
                autoComplete="username"
              />
            </div>

            {error && <p className="login-error">{error}</p>}
            {message && <p className="login-success">{message}</p>}

            <button
              type="submit"
              className="btn primary login-submit"
              disabled={isLoading}
            >
              {isLoading ? "발송 중..." : "비밀번호 재설정 링크 받기"}
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
              onClick={() => navigate("/lostid")}
            >
              아이디 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}