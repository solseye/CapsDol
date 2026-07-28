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