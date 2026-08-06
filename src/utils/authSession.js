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

export function getSafeReturnPath(locationState, role = "user") {
  if (role === "admin") return "/admin/calendar";

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

  return "/mypage";
}

export const ADMIN_HOME = "/admin/calendar";
export const USER_HOME = "/mypage";

export function isAdminSession() {
  const { token, role } = getSession();
  return Boolean(token) && role === "admin";
}
