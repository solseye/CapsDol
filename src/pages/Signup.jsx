import "../App.css";
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
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await signupUser(
        form.email,
        form.username,
        form.password
      );

      console.log("회원가입 응답:", data);

      // 👉 성공 처리 (백엔드 success 기준)
      if (!data.success) {
        throw new Error("회원가입 실패");
      }

      alert("회원가입이 완료되었습니다!");

      // 로그인 페이지로 이동
      navigate("/login");

    } catch (err) {
      console.error("회원가입 실패:", err);
      setError("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="login-card card">
          <div className="kicker">Create Account</div>
          <h1 className="section-title login-title">회원가입</h1>
          <p className="section-desc login-desc">
            계정을 생성하고 서비스를 이용해보세요.
          </p>

          <form className="login-form" onSubmit={handleSignup}>
            {/* Email */}
            <div className="login-field">
              <label className="login-label">이메일</label>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={form.email}
                onChange={handleChange}
                className="reservation-input"
              />
            </div>

            {/* Username */}
            <div className="login-field">
              <label className="login-label">아이디</label>
              <input
                type="text"
                name="username"
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={handleChange}
                className="reservation-input"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">비밀번호</label>
              <input
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                className="reservation-input"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="btn primary login-submit"
              disabled={loading}
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          {/* 로그인 이동 */}
          <div className="signup-redirect">
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className="signup-link"
              onClick={() => navigate("/login")}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}