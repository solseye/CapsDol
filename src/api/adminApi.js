import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function uploadRagFile({
  bucket = "chat",
  folder = "normal",
  file,
  fileStatus = "active",
  sourceName = "",
  sourceUrl = "",
  version = "",
  effectiveFrom = "",
  effectiveTo = "",
}) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("bucket", bucket);
  formData.append("folder", folder);
  formData.append("file_status", fileStatus);

  if (sourceName.trim()) {
    formData.append("source_name", sourceName.trim());
  }

  if (sourceUrl.trim()) {
    formData.append("source_url", sourceUrl.trim());
  }

  if (version.trim()) {
    formData.append("version", version.trim());
  }

  if (effectiveFrom) {
    formData.append("effective_from", effectiveFrom);
  }

  if (effectiveTo) {
    formData.append("effective_to", effectiveTo);
  }

  const res = await fetchWithAuth("/chat/rag/files", {
    method: "POST",
    body: formData,
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 업로드에 실패했습니다.");
  }

  return data;
}


export async function getRagFiles({ bucket = "chat", folder = "normal" }) {
  const params = new URLSearchParams({
    bucket,
    folder,
  });

  const res = await fetchWithAuth(`/chat/rag/files?${params.toString()}`, {
    method: "GET",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok || data.success === false) {
    throw new Error(data.error || "파일 목록 조회에 실패했습니다.");
  }

  return data;
}

export async function getRagFileSignedUrl({ path, expiresIn = 600 }) {
  const res = await fetchWithAuth("/chat/rag/files/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

export async function deleteRagFile(path) {
  const res = await fetchWithAuth("/chat/rag/files", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 삭제에 실패했습니다.");
  }

  return data;
}

export async function updateRagFileStatus({
  bucket = "chat",
  path,
  fileStatus = "active",
  sourceName = "",
  sourceUrl = "",
  version = "",
  effectiveFrom = "",
  effectiveTo = "",
}) {
  const res = await fetchWithAuth("/chat/rag/files/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket,
      path,
      file_status: fileStatus,
      source_name: sourceName,
      source_url: sourceUrl,
      version,
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "파일 상태 변경에 실패했습니다.");
  }

  return data;
}

export async function createRagIndex({ bucket = "chat", prefix = "normal" }) {
  const res = await fetchWithAuth("/chat/rag/index", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket,
      prefix,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "벡터 DB 제작에 실패했습니다.");
  }

  return data;
}

export async function getAdminUsers({
  limit = 100,
  offset = 0,
} = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetchWithAuth(
    `/admin/users?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || "사용자 목록을 불러오지 못했습니다."
    );
  }

  return data;
}
