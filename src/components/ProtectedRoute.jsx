import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../utils/authSession";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const session = getSession();

  if (!session.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  if (role && session.role !== role) {
    return (
      <Navigate
        to={session.role === "admin" ? "/admin/calendar" : "/mypage"}
        replace
      />
    );
  }

  return children;
}
