const BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function createArticles(payload) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(`${BASE_URL}/conv/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
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