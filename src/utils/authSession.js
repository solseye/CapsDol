export const ADMIN_HOME = "/admin/calendar";
export const USER_HOME = "/mypage";

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function getSession() {
  const token = localStorage.getItem("accessToken") || "";
  return {
    token,
    role: localStorage.getItem("role") || (token ? "user" : ""),
    user: getStoredUser(),
  };
}

export function isAuthenticated() {
  return Boolean(getSession().token);
}

export function getSessionOwner() {
  const { user } = getSession();
  return user.uuid || user.email || user.username || "guest";
}

export function saveSession(data, fallbackUser = {}) {
  const user = data.user || {
    ...fallbackUser,
    username: data.username || fallbackUser.username || "사용자",
    email: data.email || fallbackUser.email || "",
    role: data.role || fallbackUser.role || "user",
  };

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("role", data.role || user.role || "user");
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
}

// 관리자 세션인지 판단합니다. 사용자 화면 진입을 막을 때 사용합니다.
export function isAdminSession() {
  const { token, role } = getSession();
  return Boolean(token) && role === "admin";
}

// JWT의 exp를 미리 확인해 만료된 토큰으로 화면이 열리는 것을 막습니다.
// exp가 없거나 해석에 실패하면 서버 응답(401/403) 판단에 맡깁니다.
export function isTokenExpired(token = getSession().token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    if (!payload.exp) return false;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function getSafeReturnPath(locationState, role = "user") {
  if (role === "admin") return ADMIN_HOME;

  const candidate = locationState?.from;
  if (
    typeof candidate === "string" &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.startsWith("/admin") &&
    candidate !== "/login"
  ) {
    return candidate;
  }

  return USER_HOME;
}
