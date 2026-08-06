import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  refreshAccessToken,
  SESSION_EXPIRED_MESSAGE,
} from "../api/authFetch";
import { getCurrentLanguage, translate } from "../i18n/translations";
import { ADMIN_HOME, USER_HOME, getSession, isTokenExpired } from "../utils/authSession";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const session = getSession();
  const expired = Boolean(session.token) && isTokenExpired(session.token);
  const needsRefresh = !session.token || expired;

  // 액세스 토큰이 없거나 만료된 경우 바로 로그인 화면으로 보내지 않고,
  // 리프레시 토큰을 이용한 재발급이 끝날 때까지 보호 페이지 표시를 보류합니다.
  const [refreshState, setRefreshState] = useState(
    needsRefresh ? "checking" : "authenticated",
  );

  useEffect(() => {
    // 현재 액세스 토큰이 유효하면 별도의 재발급 없이 페이지를 표시합니다.
    if (!needsRefresh) {
      setRefreshState("authenticated");
      return undefined;
    }

    let active = true;

    // 리프레시 토큰이 유효하면 새 액세스 토큰을 저장한 뒤 원래 페이지를 표시합니다.
    // 리프레시 토큰도 만료되었으면 expired 상태로 변경해 로그인 화면으로 이동합니다.
    refreshAccessToken()
      .then(() => {
        if (active) setRefreshState("authenticated");
      })
      .catch(() => {
        if (active) setRefreshState("expired");
      });

    return () => {
      active = false;
    };
  }, [needsRefresh]);

  // 토큰 재발급 요청 중에는 보호된 화면을 먼저 노출하지 않습니다.
  if (refreshState === "checking") {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span />
        {translate(getCurrentLanguage(), "common.loadingPage")}
      </div>
    );
  }

  // 기존 로직은 액세스 토큰만 만료되어도 리프레시 토큰을 확인하지 않고
  // 즉시 로그인 페이지로 이동했기 때문에 아래와 같이 주석으로 보존합니다.
  /*
  if (!session.token || expired) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          message: expired ? SESSION_EXPIRED_MESSAGE : undefined,
        }}
      />
    );
  }
  */

  // 리프레시 토큰까지 만료되었거나 재발급에 실패한 경우에만 로그인으로 이동합니다.
  if (refreshState === "expired") {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          message: SESSION_EXPIRED_MESSAGE,
        }}
      />
    );
  }

  if (role && session.role !== role) {
    return (
      <Navigate
        to={session.role === "admin" ? ADMIN_HOME : USER_HOME}
        replace
      />
    );
  }

  return children;
}
