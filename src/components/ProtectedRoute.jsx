import { Navigate, useLocation } from "react-router-dom";
import { SESSION_EXPIRED_MESSAGE } from "../api/authFetch";
import { ADMIN_HOME, USER_HOME, getSession, isTokenExpired } from "../utils/authSession";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const session = getSession();
  const expired = Boolean(session.token) && isTokenExpired(session.token);

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
