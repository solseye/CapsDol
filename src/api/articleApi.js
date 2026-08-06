import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function createArticles(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("정관 생성에 필요한 입력 정보가 없습니다.");
  }

  const res = await fetchWithAuth("/conv/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    const missingFields = Array.isArray(data.missing_fields)
      ? data.missing_fields
      : Array.isArray(data.missingFields)
        ? data.missingFields
        : [];

    const missingFieldMessage =
      missingFields.length > 0
        ? `\n누락된 항목: ${missingFields.join(", ")}`
        : "";

    throw new Error(
      `${
        data.error ||
        data.message ||
        "정관 및 히어링 시트 파일 생성에 실패했습니다."
      }${missingFieldMessage}`,
    );
  }

  return {
    ...data,
    file: data.file || null,
    inputFile: data.inputFile || null,
  };
}