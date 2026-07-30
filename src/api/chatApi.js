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
  limit = 20,
  offset = 0,
} = {}) {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetchWithAuth(
    `/chat/history?${query.toString()}`,
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

  return data;
}

export async function getUserChatHistory({
  uuid,
  limit = 20,
  offset = 0,
}) {
  const res = await fetchWithAuth("/chat/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      uuid,
      limit,
      offset,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    throw new Error(
      data.error || "사용자 챗봇 대화 기록을 불러오지 못했습니다."
    );
  }

  return data;
}