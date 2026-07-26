const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const LOCAL_CHAT_LOG_KEY = "capsdolChatLogs";

async function parseJsonResponse(res) {
  return res.json().catch(() => ({}));
}

function getCurrentUserSnapshot() {
  const storedUser = localStorage.getItem("user");
  let parsedUser = {};

  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    parsedUser = {};
  }

  return {
    userId: parsedUser.id || parsedUser.user_id || parsedUser.uid || null,
    username:
      parsedUser.username ||
      parsedUser.uid ||
      parsedUser.name ||
      localStorage.getItem("username") ||
      "현재 사용자",
    email: parsedUser.email || "",
    role: localStorage.getItem("role") || parsedUser.role || "user",
  };
}

function readLocalChatLogs() {
  try {
    const rawLogs = localStorage.getItem(LOCAL_CHAT_LOG_KEY);
    const parsedLogs = rawLogs ? JSON.parse(rawLogs) : [];

    return Array.isArray(parsedLogs) ? parsedLogs : [];
  } catch {
    return [];
  }
}

function writeLocalChatLogs(logs) {
  localStorage.setItem(LOCAL_CHAT_LOG_KEY, JSON.stringify(logs.slice(0, 200)));
}

export function saveChatLogLocally({ message, answer, sources = [] }) {
  const user = getCurrentUserSnapshot();
  const logs = readLocalChatLogs();

  const nextLog = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...user,
    message,
    answer,
    sources,
    created_at: new Date().toISOString(),
    storage: "local",
  };

  writeLocalChatLogs([nextLog, ...logs]);

  return nextLog;
}

export function getLocalChatLogs() {
  return readLocalChatLogs();
}

export async function getMyChatLogs() {
  const token = localStorage.getItem("accessToken");

  if (!BASE_URL || !token) {
    return { success: true, logs: getLocalChatLogs(), source: "local" };
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/my/logs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "채팅 기록 조회에 실패했습니다.");
    }

    return {
      success: true,
      logs: data.logs || data.chatLogs || [],
      source: "server",
    };
  } catch {
    return { success: true, logs: getLocalChatLogs(), source: "local" };
  }
}

export async function getAdminChatLogs({ userId = "", keyword = "" } = {}) {
  const token = localStorage.getItem("accessToken");
  const params = new URLSearchParams();

  if (userId) params.set("userId", userId);
  if (keyword) params.set("keyword", keyword);

  if (!BASE_URL || !token) {
    return { success: true, logs: getLocalChatLogs(), source: "local" };
  }

  try {
    const query = params.toString();
    const res = await fetch(
      `${BASE_URL}/chat/admin/logs${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    const data = await parseJsonResponse(res);

    if (!res.ok) {
      throw new Error(data.error || "관리자 채팅 기록 조회에 실패했습니다.");
    }

    return {
      success: true,
      logs: data.logs || data.chatLogs || [],
      source: "server",
    };
  } catch {
    return { success: true, logs: getLocalChatLogs(), source: "local" };
  }
}
