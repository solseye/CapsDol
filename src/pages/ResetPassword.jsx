import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../api/authApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChecking, setIsChecking] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("유효하지 않은 비밀번호 재설정 링크입니다.");
        setIsChecking(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setIsValidToken(true);
      } catch (err) {
        setError(err.message || "만료되었거나 유효하지 않은 링크입니다.");
        setIsValidToken(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("새 비밀번호를 모두 입력해 주세요.");
      setMessage("");
      return;
    }

    if (newPassword.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setMessage("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      await resetPassword(token, newPassword);

      setMessage("비밀번호가 변경되었습니다. 로그인 페이지로 이동해 주세요.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card card">
          <div className="kicker">Reset Password</div>

          <h1 className="section-title login-title">비밀번호 재설정</h1>

          <p className="section-desc login-desc">
            새로 사용할 비밀번호를 입력해 주세요.
          </p>

          {isChecking && <p className="login-success">링크를 확인 중입니다...</p>}

          {!isChecking && !isValidToken && (
            <>
              <p className="login-error">{error}</p>

              <div className="signup-redirect">
                <button
                  type="button"
                  className="signup-link"
                  onClick={() => navigate("/lostpw")}
                >
                  비밀번호 찾기 다시 하기
                </button>
              </div>
            </>
          )}

          {!isChecking && isValidToken && (
            <>
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label className="login-label" htmlFor="newPassword">
                    새 비밀번호
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                    className="reservation-input"
                    autoComplete="new-password"
                  />
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="confirmPassword">
                    새 비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                      setMessage("");
                    }}
                    className="reservation-input"
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="login-error">{error}</p>}
                {message && <p className="login-success">{message}</p>}

                <button
                  type="submit"
                  className="btn primary login-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "변경 중..." : "비밀번호 변경하기"}
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}