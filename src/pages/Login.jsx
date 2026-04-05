import "../App.css";
import { useEffect, useState } from "react";
import {
  signInWithRedirect,
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Login() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log("🔥 Login 페이지 진입");

    const run = async () => {
      try {
        const result = await getRedirectResult(auth);
        console.log("🟢 getRedirectResult result:", result);

        if (result?.user) {
          console.log("✅ redirect 결과에서 user 확인 → 홈으로 이동");
          window.location.replace("/");
          return;
        }
      } catch (error) {
        console.error("❌ getRedirectResult 에러:", error);
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔥 onAuthStateChanged 호출됨");
        console.log("👉 user:", user);

        if (user) {
          console.log("✅ onAuthStateChanged에서 로그인 감지 → 홈으로 이동");
          window.location.replace("/");
        } else {
          console.log("❌ 로그인 상태 아님");
          setChecking(false);
        }
      });

      return unsubscribe;
    };

    let unsubscribe;

    run().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      console.log("🚀 로그인 버튼 클릭");

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithRedirect(auth, provider);
      console.log("➡️ redirect 시작됨");
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
      alert("구글 로그인에 실패했습니다.");
    }
  };

  if (checking) {
    return (
      <div className="login-page">
        <h2>로그인 확인 중...</h2>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h2>로그인</h2>
      <button onClick={handleGoogleLogin} className="btn primary">
        Google로 로그인
      </button>
    </div>
  );
}