import "../App.css";
import "../styles/auth-visily.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../api/authApi";

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "1008976808306-khvao892b8n9rv6lmk89k9qoba9i03m6.apps.googleusercontent.com";

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
      const role = localStorage.getItem("role");
      navigate(role === "admin" ? "/admin/calendar" : "/");
    }
  }, [navigate]);

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      const idToken = response.credential;

      try {
        setGoogleLoading(true);
        setError("");

        const data = await loginWithGoogle(idToken);

        if (!data.success || !data.accessToken) {
          throw new Error("구글 로그인 실패");
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user || {
              username: data.username || "Google 사용자",
              email: data.email || "",
              role: data.role,
            }
          )
        );

        navigate(data.role === "admin" ? "/admin/calendar" : "/");
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
        client_id: GOOGLE_CLIENT_ID,
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
      localStorage.setItem("role", data.role);
      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || {
            username: form.username.trim(),
            email: data.email || "",
            role: data.role,
          }
        )
      );
      navigate(data.role === "admin" ? "/admin/calendar" : "/");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError("아이디 또는 비밀번호를 다시 확인해 주세요.");
    } finally {
      setLoading(false);
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
            AI로 일본 진출 준비를
            <span>더 빠르고 정확하게</span>
          </h1>
          <p>
            법인 설립, 정관 초안, 세무·회계 질문, 전문가 상담 예약까지
            하나의 업무 흐름으로 정리하세요.
          </p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>문서 중심 보안</strong>
              <p>기업 정보와 법무 자료를 업무 단위로 정리합니다.</p>
            </div>
            <div>
              <span>✓</span>
              <strong>전문가 연결</strong>
              <p>AI가 정리한 내용을 상담 예약으로 이어갑니다.</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">일본 시장 진출을 준비하는 기업을 위한 WVA 업무 플랫폼</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>다시 오신 것을 환영합니다</h2>
            <p>일본 진출 운영 시스템에 접속하려면 로그인해 주세요.</p>
          </div>

          <div className="authv-google-box">
            <div ref={googleButtonRef} className="authv-google-button" />
            {googleLoading && <p>구글 로그인 처리 중...</p>}
          </div>

          <div className="authv-divider">
            <span>또는 아이디로 계속하기</span>
          </div>

          <div className="authv-tabs">
            <button type="button" className="active">
              로그인
            </button>
            <button type="button" onClick={() => navigate("/signup")}>
              회원가입
            </button>
          </div>

          <form className="authv-form" onSubmit={handleLogin}>
            <div className="authv-field">
              <label htmlFor="username">아이디</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="authv-field">
              <div className="authv-label-row">
                <label htmlFor="password">비밀번호</label>
                <button type="button" onClick={() => navigate("/lostpw")}>
                  비밀번호 찾기
                </button>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <label className="authv-remember">
              <input type="checkbox" />
              <span>이 기기에서 로그인 상태 유지</span>
            </label>

            {error && <p className="authv-error">{error}</p>}

            <button type="submit" className="authv-submit" disabled={loading}>
              {loading ? "로그인 중..." : "WVA에 로그인"} <span>→</span>
            </button>
          </form>

          <div className="authv-help">
            <button type="button" onClick={() => navigate("/lostid")}>
              아이디 찾기
            </button>
            <span>도움이 필요하신가요?</span>
            <button type="button" onClick={() => navigate("/reservation")}>
              전문가 상담
            </button>
          </div>

          <div className="authv-compliance">
            <span>문서 기반 상담</span>
            <span>AI 상담 지원</span>
            <span>전문가 검토 연결</span>
          </div>
        </div>
      </section>
    </div>
  );
}
