import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function sendQuestion({
  message,
  ragPrefix = "normal",
  ragMatchCount = 5,
  system,
}) {

  const res = await fetchWithAuth(`/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message,
      rag_bucket: "chat",
      rag_prefix: ragPrefix,
      rag_match_count: ragMatchCount,
      system,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "챗봇 응답 생성에 실패했습니다.");
  }

  return data;
}

export async function getChatHistory({
  uuid,
  limit = 20,
  offset = 0,
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const trimmedUuid = String(uuid || "").trim();

  if (trimmedUuid) {
    params.set("uuid", trimmedUuid);
  }

  const res = await fetchWithAuth(
    `/chat/history?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    throw new Error(
      data.error || "챗봇 대화 기록을 불러오지 못했습니다."
    );
  }

  return {
    ...data,
    histories: Array.isArray(data.histories)
      ? data.histories
      : [],
  };
}

export async function getUserChatHistory({
  uuid,
  limit = 20,
  offset = 0,
} = {}) {
  const trimmedUuid = String(uuid || "").trim();

  if (!trimmedUuid) {
    throw new Error("사용자 UUID가 필요합니다.");
  }

  return getChatHistory({
    uuid: trimmedUuid,
    limit,
    offset,
  });
}

export async function getChatHistoryByPost({
  uuid,
  limit = 20,
  offset = 0,
} = {}) {
  const requestBody = {
    limit,
    offset,
  };

  const trimmedUuid = String(uuid || "").trim();

  if (trimmedUuid) {
    requestBody.uuid = trimmedUuid;
  }

  const res = await fetchWithAuth("/chat/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    throw new Error(
      data.error || "챗봇 대화 기록을 불러오지 못했습니다."
    );
  }

  return {
    ...data,
    histories: Array.isArray(data.histories)
      ? data.histories
      : [],
  };
}