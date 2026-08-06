import { clearSession } from "../utils/authSession";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const SESSION_EXPIRED_EVENT = "auth:session-expired";
export const SESSION_EXPIRED_MESSAGE =
  "로그인이 만료되었습니다. 다시 로그인해 주세요.";

// 세션이 끊긴 사실을 앱 전체에 한 번만 알립니다.
// 실제 화면 이동은 SessionWatcher가 담당합니다.
function notifySessionExpired() {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("API 서버 주소가 설정되지 않았습니다.");
  }

  return API_BASE_URL;
}

export function getAccessToken() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  return token;
}

async function refreshAccessToken() {
  const response = await fetch(`${getApiBaseUrl()}/token`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.accessToken) {
    notifySessionExpired();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
}

function buildAuthOptions(options, token) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return {
    ...options,
    headers,
    credentials: "include",
  };
}

export async function fetchWithAuth(path, options = {}) {
  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`;
  let token;

  try {
    token = getAccessToken();
  } catch (err) {
    notifySessionExpired();
    throw err;
  }

  let response = await fetch(url, buildAuthOptions(options, token));

  if (response.status !== 401 && response.status !== 403) {
    return response;
  }

  token = await refreshAccessToken();
  response = await fetch(url, buildAuthOptions(options, token));

  // 재발급받은 토큰으로도 거절되면 세션이 확실히 끊긴 상태입니다.
  if (response.status === 401 || response.status === 403) {
    notifySessionExpired();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  return response;
}
