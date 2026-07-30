import "../App.css";
import "../styles/auth-visily.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../api/authApi";
import {
  getSafeReturnPath,
  saveSession,
} from "../utils/authSession";
import { getPageCopy } from "../i18n/pageCopy";
import { getCurrentLanguage } from "../i18n/translations";

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "1008976808306-khvao892b8n9rv6lmk89k9qoba9i03m6.apps.googleusercontent.com";

export default function Login() {
  const copy = getPageCopy("auth");
  const navigate = useNavigate();
  const location = useLocation();
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
      navigate(getSafeReturnPath(location.state, role), {
        replace: true,
        state: location.state?.routeState,
      });
    }
  }, [location.state, navigate]);

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      const idToken = response.credential;

      try {
        setGoogleLoading(true);
        setError("");

        const data = await loginWithGoogle(idToken);

        if (!data.success || !data.accessToken) {
          throw new Error(copy.googleError);
        }

        saveSession(data, {
          username: copy.googleUser,
          role: data.role,
        });
        navigate(getSafeReturnPath(location.state, data.role), {
          replace: true,
          state: location.state?.routeState,
        });
      } catch (err) {
        console.error("구글 로그인 에러:", err);
        setError(copy.googleError);
      } finally {
        setGoogleLoading(false);
      }
    },
    [copy.googleError, copy.googleUser, location.state, navigate]
  );

  useEffect(() => {
    const googleLocale = getCurrentLanguage();
    const googleScriptSrc = `https://accounts.google.com/gsi/client?hl=${googleLocale}`;
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
        locale: getCurrentLanguage(),
      });
    };

    const existingScript = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      initializeGoogleLogin();
      return;
    }

    const script = document.createElement("script");
    script.src = googleScriptSrc;
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
      setError(copy.requiredError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form.username, form.password);

      if (!data.success || !data.accessToken) {
        throw new Error("로그인 실패");
      }

      saveSession(data, {
        username: form.username.trim(),
        email: data.email || "",
        role: data.role,
      });
      navigate(getSafeReturnPath(location.state, data.role), {
        replace: true,
        state: location.state?.routeState,
      });
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(copy.loginError);
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
          aria-label={copy.brandHome}
        >
          <span>◎</span>
          <strong>{copy.brandName}</strong>
        </button>

        <div className="authv-brand-copy">
          <h1>
            {copy.heroTitle}
            <span>{copy.heroAccent}</span>
          </h1>
          <p>{copy.heroBody}</p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>{copy.proof1Title}</strong>
              <p>{copy.proof1Body}</p>
            </div>
            <div>
              <span>✓</span>
              <strong>{copy.proof2Title}</strong>
              <p>{copy.proof2Body}</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">{copy.trust}</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>{copy.welcome}</h2>
            <p>{copy.loginIntro}</p>
          </div>

          <div className="authv-google-box">
            <div ref={googleButtonRef} className="authv-google-button" />
            {googleLoading && <p>{copy.googleLoading}</p>}
          </div>

          <div className="authv-divider">
            <span>{copy.continueId}</span>
          </div>

          <div className="authv-tabs">
            <button type="button" className="active">
              {copy.login}
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup", { state: location.state })}
            >
              {copy.signup}
            </button>
          </div>

          <form className="authv-form" onSubmit={handleLogin}>
            <div className="authv-field">
              <label htmlFor="username">{copy.username}</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder={copy.usernamePlaceholder}
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="authv-field">
              <div className="authv-label-row">
                <label htmlFor="password">{copy.password}</label>
                <button type="button" onClick={() => navigate("/lostpw")}>
                  {copy.findPassword}
                </button>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder={copy.passwordPlaceholder}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <p className="authv-remember">
              <span>{copy.publicDevice}</span>
            </p>

            {location.state?.message && !error && (
              <p className="authv-success">{location.state.message}</p>
            )}
            {error && <p className="authv-error">{error}</p>}

            <button type="submit" className="authv-submit" disabled={loading}>
              {loading ? copy.loggingIn : copy.loginButton} <span>→</span>
            </button>
          </form>

          <div className="authv-help">
            <button type="button" onClick={() => navigate("/lostid")}>
              {copy.findId}
            </button>
            <span>{copy.needHelp}</span>
            <button type="button" onClick={() => navigate("/#experts")}>
              {copy.expertInfo}
            </button>
          </div>

          <div className="authv-compliance">
            <span>{copy.compliance1}</span>
            <span>{copy.compliance2}</span>
            <span>{copy.compliance3}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
