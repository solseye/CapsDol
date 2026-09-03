import "../App.css";
import "../styles/auth-visily.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../api/authApi";
import BrandLogo from "../components/BrandLogo";

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
    <div className="authv-page">
      <section className="authv-brand-panel">
        <BrandLogo
          as="button"
          className="authv-brand"
          onClick={() => navigate("/")}
          ariaLabel="RtJ 사무소 홈으로 이동"
          markClassName="authv-brand-mark"
          copyClassName="authv-brand-label"
          hideSubtitle
        />

        <div className="authv-brand-copy">
          <h1>
            새 비밀번호로
            <span>계정을 보호하세요</span>
          </h1>
          <p>
            비밀번호 재설정 링크를 확인한 뒤, 앞으로 사용할 새 비밀번호를
            설정합니다.
          </p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>링크 검증</strong>
              <p>유효한 재설정 링크인지 먼저 확인합니다.</p>
            </div>
            <div>
              <span>✓</span>
              <strong>새 비밀번호 설정</strong>
              <p>8자 이상의 새 비밀번호로 계정 접근을 다시 설정합니다.</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">WVA Japan Entry OS 계정 보안 설정</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>비밀번호 재설정</h2>
            <p>새로 사용할 비밀번호를 입력해 주세요.</p>
          </div>

          <div className="authv-divider">
            <span>새 비밀번호 설정</span>
          </div>

          {isChecking && <p className="authv-success">링크를 확인 중입니다...</p>}

          {!isChecking && !isValidToken && (
            <>
              <p className="authv-error">{error}</p>

              <div className="authv-help">
                <button
                  type="button"
                  onClick={() => navigate("/lostpw")}
                >
                  비밀번호 찾기 다시 하기
                </button>
              </div>
            </>
          )}

          {!isChecking && isValidToken && (
            <>
              <form className="authv-form" onSubmit={handleSubmit}>
                <div className="authv-field">
                  <label htmlFor="newPassword">새 비밀번호</label>
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
                    autoComplete="new-password"
                  />
                </div>

                <div className="authv-field">
                  <label htmlFor="confirmPassword">새 비밀번호 확인</label>
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
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="authv-error">{error}</p>}
                {message && <p className="authv-success">{message}</p>}

                <button
                  type="submit"
                  className="authv-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "변경 중..." : "비밀번호 변경하기"} <span>→</span>
                </button>
              </form>

              <div className="authv-help">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </>
          )}

          <div className="authv-compliance">
            <span>링크 검증</span>
            <span>비밀번호 보호</span>
            <span>계정 복구</span>
          </div>
        </div>
      </section>
    </div>
  );
}
