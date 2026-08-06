import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function createArticles(payload) {
  const res = await fetchWithAuth("/conv/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    const missingFields = Array.isArray(data.missingFields)
      ? `\n누락된 항목: ${data.missingFields.join(", ")}`
      : "";

    throw new Error(
      `${
        data.error ||
        data.message ||
        "정관 생성에 실패했습니다."
      }${missingFields}`
    );
  }

  return data;
}