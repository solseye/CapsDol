import "../App.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      const idToken = response.credential;

      try {
        setGoogleLoading(true);
        setError("");

        const data = await loginWithGoogle(idToken);

        if (!data.accessToken) {
          throw new Error("구글 로그인 실패");
        }

        localStorage.setItem("accessToken", data.accessToken);
        navigate("/");
      } catch (err) {
        console.error("구글 로그인 에러:", err);
        setError("구글 로그인에 실패했습니다.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const initializeGoogleLogin = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id:
          "1008976808306-khvao892b8n9rv6lmk89k9qoba9i03m6.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
        text: "signin_with",
        logo_alignment: "left",
      });
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      initializeGoogleLogin();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleLogin;
    document.body.appendChild(script);
  }, [handleGoogleCredentialResponse]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form.username, form.password);

      if (!data.success || !data.accessToken) {
        throw new Error("로그인 실패");
      }

      localStorage.setItem("accessToken", data.accessToken);
      navigate("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError("아이디 또는 비밀번호를 다시 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card card">
          <div className="kicker">Member Login</div>
          <h1 className="section-title login-title">로그인</h1>
          <p className="section-desc login-desc">
            로그인 후 상담 예약 및 챗봇 서비스를 이용할 수 있습니다.
          </p>

          <div className="google-login-section">
            <div className="login-subtitle">Google 계정으로 로그인</div>
            <div ref={googleButtonRef} className="google-login-button" />
            {googleLoading && (
              <p className="login-helper-text">구글 로그인 처리 중...</p>
            )}
          </div>

          <div className="login-divider">
            <span>또는</span>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label" htmlFor="username">
                아이디
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={handleChange}
                className="reservation-input"
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                className="reservation-input"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="btn primary login-submit"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="signup-redirect">
            <span>계정이 없으신가요?</span>
            <button
                type="button"
                className="signup-link"
                onClick={() => navigate("/signup")}
            >
                가입하기
            </button>
        </div>
        </div>
      </div>
    </div>
  );
}