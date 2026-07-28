import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function getClientFiles({
  bucket = "users",
  prefix = "",
  limit = 100,
  offset = 0,
} = {}) {
  const role = localStorage.getItem("role");

  const params = new URLSearchParams({
    bucket,
    limit: String(limit),
    offset: String(offset),
  });

  if (role === "admin" && prefix.trim()) {
    params.append("prefix", prefix.trim());
  }

  const response = await fetchWithAuth(`/client/files?${params.toString()}`,
    {
      method: "GET",
      headers: {
      },
      credentials: "include",
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || "파일 목록을 불러오지 못했습니다."
    );
  }

  return data;
}

export async function uploadClientFile({
  file,
  fileName,
  description,
  bucket = "users",
  uuid = "",
}) {
  const role = localStorage.getItem("role");

  if (!(file instanceof File)) {
    throw new Error("업로드할 파일을 선택해 주세요.");
  }

  if (!fileName?.trim()) {
    throw new Error("파일 명칭을 입력해 주세요.");
  }

  if (!description?.trim()) {
    throw new Error("파일 설명을 입력해 주세요.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("file_name", fileName.trim());
  formData.append("description", description.trim());
  formData.append("bucket", bucket);

  if (role === "admin") {
    if (!uuid.trim()) {
      throw new Error("대상 사용자 UUID를 입력해 주세요.");
    }

    formData.append("uuid", uuid.trim());
  }

  const response = await fetchWithAuth(`/client/files`,
    {
      method: "POST",
      headers: {
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || "파일 업로드에 실패했습니다."
    );
  }

  return data;
}

export async function deleteClientFile({
  path,
  bucket = "users",
}) {

  if (!path?.trim()) {
    throw new Error("삭제할 파일 경로가 없습니다.");
  }

  const response = await fetchWithAuth(`/client/files`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bucket,
        path: path.trim(),
      }),
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || "파일 삭제에 실패했습니다."
    );
  }

  return data;
}

export async function getClientFileSignedUrl({
  path,
  bucket = "users",
  expiresIn = 600,
  download = false,
}) {

  if (!path?.trim()) {
    throw new Error("파일 경로가 없습니다.");
  }

  const response = await fetchWithAuth(`/client/files/signed-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bucket,
        path: path.trim(),
        expires_in: expiresIn,
        download,
      }),
    }
  );

  const data = await parseJsonResponse(response);

  if (!response.ok || data.success === false) {
    throw new Error(
      data.error || "파일 URL 생성에 실패했습니다."
    );
  }

  return data;
}