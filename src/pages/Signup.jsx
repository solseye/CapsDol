import "../App.css";
import "../styles/auth-visily.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle, signupUser } from "../api/authApi";
import {
  getSafeReturnPath,
  saveSession,
} from "../utils/authSession";
import { getPageCopy } from "../i18n/pageCopy";
import { getCurrentLanguage } from "../i18n/translations";

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "1008976808306-khvao892b8n9rv6lmk89k9qoba9i03m6.apps.googleusercontent.com";

export default function Signup() {
  const authCopy = getPageCopy("auth");
  const copy = getPageCopy("signup");
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      if (!response?.credential) {
        setError(copy.googleCredentialError);
        return;
      }

      try {
        setGoogleLoading(true);
        setError("");

        const data = await loginWithGoogle(response.credential);

        if (!data.success || !data.accessToken) {
          throw new Error(
            data.error || data.msg || copy.googleError
          );
        }

        saveSession(data, {
          username: authCopy.googleUser,
          role: data.role || "user",
        });
        navigate(getSafeReturnPath(location.state, data.role), {
          replace: true,
          state: location.state?.routeState,
        });
      } catch (err) {
        console.error("구글 회원가입 에러:", err);
        setError(
          err.message || copy.googleError
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [authCopy.googleUser, copy.googleCredentialError, copy.googleError, location.state, navigate]
  );

  useEffect(() => {
    const googleLocale = getCurrentLanguage();
    const googleScriptSrc = `https://accounts.google.com/gsi/client?hl=${googleLocale}`;
    const initializeGoogleSignup = () => {
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
        text: "signup_with",
        logo_alignment: "left",
        locale: getCurrentLanguage(),
      });
    };

    const existingScript = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      if (window.google) {
        initializeGoogleSignup();
      } else {
        existingScript.addEventListener("load", initializeGoogleSignup, {
          once: true,
        });
      }

      return () => {
        existingScript.removeEventListener("load", initializeGoogleSignup);
      };
    }

    const script = document.createElement("script");
    script.src = googleScriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignup;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [handleGoogleCredentialResponse]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.username.trim() || !form.password.trim()) {
      setError(copy.requiredError);
      return;
    }

    if (!acceptedTerms) {
      setError(copy.consentError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await signupUser(
        form.email.trim(),
        form.username.trim(),
        form.password
      );

      if (!data.success) {
        throw new Error(data.error || data.msg || "회원가입 실패");
      }

      const loginData = await loginUser(
        form.username.trim(),
        form.password
      );

      if (loginData.success && loginData.accessToken) {
        saveSession(loginData, {
          username: form.username.trim(),
          email: form.email.trim(),
          role: loginData.role || "user",
        });
        navigate(getSafeReturnPath(location.state, loginData.role), {
          replace: true,
          state: location.state?.routeState,
        });
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          ...location.state,
          message: copy.success,
        },
      });
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err.message || copy.signupError);
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
          aria-label={authCopy.brandHome}
        >
          <span>◎</span>
          <strong>{authCopy.brandName}</strong>
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
            <h2>{copy.title}</h2>
            <p>{copy.intro}</p>
          </div>

          <div className="authv-google-box">
            <div ref={googleButtonRef} className="authv-google-button" />
            {googleLoading && <p>{copy.googleLoading}</p>}
          </div>

          <div className="authv-divider">
            <span>{copy.continueEmail}</span>
          </div>

          <div className="authv-tabs">
            <button
              type="button"
              onClick={() => navigate("/login", { state: location.state })}
            >
              {authCopy.login}
            </button>
            <button type="button" className="active">
              {authCopy.signup}
            </button>
          </div>

          <form className="authv-form" onSubmit={handleSignup}>
            <div className="authv-field">
              <label htmlFor="email">{copy.email}</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

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
              <label htmlFor="password">{copy.password}</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder={copy.passwordPlaceholder}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <label className="authv-remember">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>{copy.consent}</span>
            </label>

            {error && <p className="authv-error">{error}</p>}

            <button type="submit" className="authv-submit" disabled={loading}>
              {loading ? copy.signingUp : copy.signupButton} <span>→</span>
            </button>
          </form>

          <div className="authv-help">
            <span>{copy.haveAccount}</span>
            <button
              type="button"
              onClick={() => navigate("/login", { state: location.state })}
            >
              {copy.login}
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
