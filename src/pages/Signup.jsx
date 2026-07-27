import "../App.css";
import "../styles/auth-visily.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/authApi";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("이메일, 아이디, 비밀번호를 모두 입력해 주세요.");
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

      alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login");
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err.message || "회원가입에 실패했습니다.");
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
            일본 진출 준비를
            <span>WVA 계정으로 시작하세요</span>
          </h1>
          <p>
            AI 챗봇 상담, 히어링 시트 작성, 정관 초안 확인, 전문가 상담 예약을
            하나의 계정으로 이용할 수 있습니다.
          </p>

          <div className="authv-proof-grid">
            <div>
              <span>✓</span>
              <strong>히어링 시트</strong>
              <p>기업 정보를 정리하고 정관 초안으로 연결합니다.</p>
            </div>
            <div>
              <span>✓</span>
              <strong>예약 관리</strong>
              <p>전문가 상담 일정을 신청하고 상태를 확인합니다.</p>
            </div>
          </div>
        </div>

        <p className="authv-trust">일본 법무·세무 상담 준비를 위한 AI 워크플로우</p>
      </section>

      <section className="authv-form-panel">
        <div className="authv-card">
          <div className="authv-title">
            <h2>계정 만들기</h2>
            <p>WVA의 AI 상담과 전문가 연결 기능을 이용할 계정을 생성합니다.</p>
          </div>

          <div className="authv-tabs">
            <button type="button" onClick={() => navigate("/login")}>
              로그인
            </button>
            <button type="button" className="active">
              회원가입
            </button>
          </div>

          <form className="authv-form" onSubmit={handleSignup}>
            <div className="authv-field">
              <label htmlFor="email">업무 이메일</label>
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
              <label htmlFor="username">아이디</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="로그인에 사용할 아이디"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="authv-field">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <label className="authv-remember">
              <input type="checkbox" />
              <span>서비스 이용을 위한 계정 생성에 동의합니다</span>
            </label>

            {error && <p className="authv-error">{error}</p>}

            <button type="submit" className="authv-submit" disabled={loading}>
              {loading ? "가입 중..." : "WVA 계정 생성"} <span>→</span>
            </button>
          </form>

          <div className="authv-help">
            <span>이미 계정이 있으신가요?</span>
            <button type="button" onClick={() => navigate("/login")}>
              로그인하기
            </button>
          </div>

          <div className="authv-compliance">
            <span>문서 기반 상담</span>
            <span>다국어 지원</span>
            <span>전문가 연결</span>
          </div>
        </div>
      </section>
    </div>
  );
}
