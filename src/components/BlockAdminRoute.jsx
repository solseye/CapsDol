import { Navigate } from "react-router-dom";
import { ADMIN_HOME, isAdminSession } from "../utils/authSession";

// 관리자가 홈이나 일반 사용자 화면에 들어오면 관리자 콘솔로 되돌립니다.
export default function BlockAdminRoute({ children }) {
  if (isAdminSession()) {
    return <Navigate to={ADMIN_HOME} replace />;
  }

  return children;
}
