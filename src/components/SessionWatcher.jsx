import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SESSION_EXPIRED_EVENT,
  SESSION_EXPIRED_MESSAGE,
} from "../api/authFetch";
import { clearSession } from "../utils/authSession";

// 로그인 없이도 볼 수 있는 화면에서는 만료되어도 이동시키지 않습니다.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/lostid",
  "/lostpw",
  "/reset-password",
];

// 토큰 만료를 감지해 로그인 화면으로 돌려보냅니다.
export default function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const goToLogin = () => {
      clearSession();

      if (PUBLIC_PATHS.includes(location.pathname)) return;

      navigate("/login", {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
          message: SESSION_EXPIRED_MESSAGE,
        },
      });
    };

    // 다른 탭에서 로그아웃하거나 세션이 끊긴 경우도 함께 반영합니다.
    const handleStorage = (event) => {
      if (event.key === "accessToken" && !event.newValue) {
        goToLogin();
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, goToLogin);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, goToLogin);
      window.removeEventListener("storage", handleStorage);
    };
  }, [location, navigate]);

  return null;
}
