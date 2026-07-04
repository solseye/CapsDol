const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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