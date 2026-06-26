const BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function uploadRagFile({ folder = "normal", file }) {
  const token = localStorage.getItem("accessToken");

  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/chat/rag/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: formData,
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 업로드에 실패했습니다.");
  }

  return data;
}


export async function getRagFiles({ folder = "normal", limit = 100, offset = 0 }) {
  const token = localStorage.getItem("accessToken");

  const params = new URLSearchParams({
    folder,
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${BASE_URL}/chat/rag/files?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 목록 조회에 실패했습니다.");
  }

  return data;
}

export async function getRagFileSignedUrl({ path, expiresIn = 600 }) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/chat/rag/files/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      path,
      expires_in: expiresIn,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 URL 발급에 실패했습니다.");
  }

  return data;
}