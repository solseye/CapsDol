import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAdminUsers } from "../../../api/adminApi";

import {
  deleteClientFile,
  getClientFiles,
  getClientFileSignedUrl,
} from "../../../api/clientFileApi";

function formatFileSize(size) {
  const bytes = Number(size || 0);

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("ko-KR");
}

function getFilePath(file) {
  return file.storagePath || file.path || "";
}

function getFileTypeLabel(fileType, originalName) {
  const fileName = String(originalName || "");
  const lastDotIndex = fileName.lastIndexOf(".");

  if (
    lastDotIndex >= 0 &&
    lastDotIndex < fileName.length - 1
  ) {
    return fileName
      .slice(lastDotIndex + 1)
      .toUpperCase();
  }

  if (fileType === "application/pdf") {
    return "PDF";
  }

  if (fileType?.includes("word")) {
    return "DOCX";
  }

  if (
    fileType?.includes("spreadsheet") ||
    fileType?.includes("excel")
  ) {
    return "XLSX";
  }

  if (fileType?.includes("text")) {
    return "TXT";
  }

  return "FILE";
}

function getProviderLabel(provider) {
  switch (provider) {
    case "local":
      return "일반 가입";
    case "google":
      return "Google";
    case "kakao":
      return "Kakao";
    case "naver":
      return "Naver";
    default:
      return provider || "-";
  }
}

export default function UsersDetailPage() {
  const { uuid: encodedUuid } = useParams();

  const uuid = useMemo(
    () => decodeURIComponent(encodedUuid || ""),
    [encodedUuid]
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [clientFiles, setClientFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [previewLoadingPath, setPreviewLoadingPath] =
    useState(null);
  const [downloadLoadingPath, setDownloadLoadingPath] =
    useState(null);
  const [deleteLoadingPath, setDeleteLoadingPath] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSelectedUser = async () => {
    if (!uuid) {
      setSelectedUser(null);
      setError("사용자 UUID가 없습니다.");
      setIsUserLoading(false);
      return;
    }

    try {
      setIsUserLoading(true);
      setError("");

      const limit = 100;
      let offset = 0;
      let matchedUser = null;
      let hasMore = true;

      while (hasMore && !matchedUser) {
        const data = await getAdminUsers({
          limit,
          offset,
        });

        const users = Array.isArray(data.users)
          ? data.users
          : [];

        matchedUser =
          users.find(
            (user) =>
              String(user.uuid) === String(uuid)
          ) || null;

        const total = Number(data.total);

        if (Number.isFinite(total) && total > 0) {
          offset += limit;
          hasMore = offset < total;
        } else {
          hasMore = users.length === limit;
          offset += limit;
        }
      }

      if (!matchedUser) {
        throw new Error(
          "해당 사용자 정보를 찾을 수 없습니다."
        );
      }

      setSelectedUser(matchedUser);
    } catch (err) {
      setSelectedUser(null);
      setError(
        err.message ||
          "사용자 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsUserLoading(false);
    }
  };

  const fetchUserFiles = async () => {
    if (!uuid) {
      setClientFiles([]);
      setError("사용자 UUID가 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getClientFiles({
        bucket: "users",
        prefix: uuid,
        limit: 100,
        offset: 0,
      });

      const files = Array.isArray(data.files)
        ? data.files
        : [];

      const sortedFiles = [...files].sort((a, b) => {
        const dateA = new Date(
          a.uploadedAt || a.updatedAt || 0
        ).getTime();

        const dateB = new Date(
          b.uploadedAt || b.updatedAt || 0
        ).getTime();

        return dateB - dateA;
      });

      setClientFiles(sortedFiles);
    } catch (err) {
      setClientFiles([]);
      setError(
        err.message ||
          "사용자 파일 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedUser();
    fetchUserFiles();

    // uuid가 바뀔 때만 다시 조회합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleRefresh = async () => {
    setSuccess("");
    await Promise.all([
      fetchSelectedUser(),
      fetchUserFiles(),
    ]);
  };

  const handlePreviewFile = async (file) => {
    const path = getFilePath(file);

    if (!path) {
      setError(
        "미리보기할 파일 경로를 찾을 수 없습니다."
      );
      return;
    }

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setError(
        "팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요."
      );
      return;
    }

    previewWindow.document.title = "파일 미리보기";
    previewWindow.document.body.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        font-family: sans-serif;
        color: #555;
      ">
        파일을 불러오는 중입니다...
      </div>
    `;

    try {
      setError("");
      setSuccess("");
      setPreviewLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: false,
      });

      if (!data.signedUrl) {
        throw new Error(
          "미리보기 URL을 받지 못했습니다."
        );
      }

      previewWindow.opener = null;
      previewWindow.location.replace(data.signedUrl);
    } catch (err) {
      previewWindow.close();

      setError(
        err.message || "파일 미리보기에 실패했습니다."
      );
    } finally {
      setPreviewLoadingPath(null);
    }
  };

  const handleDownloadFile = async (file) => {
    const path = getFilePath(file);

    if (!path) {
      setError(
        "다운로드할 파일 경로를 찾을 수 없습니다."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");
      setDownloadLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: true,
      });

      if (!data.signedUrl) {
        throw new Error(
          "다운로드 URL을 받지 못했습니다."
        );
      }

      const response = await fetch(data.signedUrl);

      if (!response.ok) {
        throw new Error(
          "파일 데이터를 불러오지 못했습니다."
        );
      }

      const blob = await response.blob();
      const blobUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        data.downloadName ||
        file.originalName ||
        file.fileName ||
        "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(
        err.message || "파일 다운로드에 실패했습니다."
      );
    } finally {
      setDownloadLoadingPath(null);
    }
  };

  const handleDeleteFile = async (file) => {
    const path = getFilePath(file);

    if (!path) {
      setError(
        "삭제할 파일 경로를 찾을 수 없습니다."
      );
      return;
    }

    const displayName =
      file.fileName ||
      file.originalName ||
      "파일";

    const ok = window.confirm(
      `"${displayName}"을 삭제하시겠습니까?\n\n관리자가 삭제하면 사용자의 마이페이지에서도 제거됩니다.`
    );

    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      setDeleteLoadingPath(path);

      const data = await deleteClientFile({
        bucket: file.bucket || "users",
        path,
      });

      if (!data.success) {
        throw new Error(
          data.message || "파일 삭제에 실패했습니다."
        );
      }

      setClientFiles((prev) =>
        prev.filter(
          (item) => getFilePath(item) !== path
        )
      );

      setSuccess("사용자 파일이 삭제되었습니다.");
    } catch (err) {
      setError(
        err.message || "파일 삭제에 실패했습니다."
      );
    } finally {
      setDeleteLoadingPath(null);
    }
  };

  return (
    <main className="adm-main admin-user-detail-page">
      <section className="adm-page-head">
        <div>
          <p className="adm-eyebrow">
            User My Page
          </p>

          <h1>
            {isUserLoading
              ? "사용자 정보를 불러오는 중..."
              : selectedUser?.username ||
                selectedUser?.uid ||
                "사용자 상세"}
          </h1>

          <p>
            선택한 사용자의 정보와 업로드 파일을
            확인합니다.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="adm-btn ghost"
        >
          사용자 목록으로
        </Link>
      </section>

      <section className="adm-card admin-user-profile-card">
        <div className="adm-card-head">
          <div>
            <p className="adm-eyebrow">
              User Information
            </p>
            <h2>사용자 정보</h2>
          </div>
        </div>

        {isUserLoading ? (
          <div className="reserve-empty-box">
            사용자 정보를 불러오는 중입니다.
          </div>
        ) : selectedUser ? (
          <div className="admin-user-profile-grid">
            <div>
              <span>이름</span>
              <strong>
                {selectedUser.username || "-"}
              </strong>
            </div>

            <div>
              <span>아이디</span>
              <strong>
                {selectedUser.uid || "-"}
              </strong>
            </div>

            <div>
              <span>이메일</span>
              <strong>
                {selectedUser.email || "-"}
              </strong>
            </div>

            <div>
              <span>가입 방식</span>
              <strong>
                {getProviderLabel(
                  selectedUser.provider
                )}
              </strong>
            </div>

            <div className="admin-user-profile-uuid">
              <span>UUID</span>
              <code>{uuid || "-"}</code>
            </div>
          </div>
        ) : (
          <div className="reserve-empty-box">
            사용자를 찾을 수 없습니다.
          </div>
        )}
      </section>

      <section className="adm-card admin-user-files-card">
        <div className="adm-card-head">
          <div>
            <p className="adm-eyebrow">
              Uploaded Files
            </p>
            <h2>사용자 업로드 파일</h2>
          </div>

          <button
            type="button"
            className="adm-btn ghost"
            onClick={handleRefresh}
            disabled={isLoading || isUserLoading}
          >
            {isLoading || isUserLoading
              ? "조회 중..."
              : "새로고침"}
          </button>
        </div>

        {error && (
          <p className="login-error">{error}</p>
        )}

        {success && (
          <p className="login-success">
            {success}
          </p>
        )}

        {isLoading ? (
          <div className="reserve-empty-box">
            사용자 파일을 불러오는 중입니다.
          </div>
        ) : clientFiles.length === 0 ? (
          <div className="reserve-empty-box">
            이 사용자가 업로드한 파일이 없습니다.
          </div>
        ) : (
          <div className="admin-user-file-list">
            {clientFiles.map((file) => {
              const path = getFilePath(file);

              const displayName =
                file.fileName ||
                file.originalName ||
                "이름 없는 파일";

              const originalName =
                file.originalName || "-";

              const isBusy =
                previewLoadingPath === path ||
                downloadLoadingPath === path ||
                deleteLoadingPath === path;

              return (
                <article
                  key={file.id || path}
                  className="admin-user-file-item"
                >
                  <div className="mypage-file-type">
                    {getFileTypeLabel(
                      file.fileType,
                      originalName
                    )}
                  </div>

                  <div className="mypage-file-info">
                    <strong>{displayName}</strong>

                    {displayName !== originalName && (
                      <span>
                        원본 파일명: {originalName}
                      </span>
                    )}

                    <span>
                      {formatFileSize(file.size)} ·{" "}
                      {formatDateTime(
                        file.uploadedAt ||
                          file.updatedAt
                      )}
                    </span>

                    {file.description && (
                      <small>
                        설명: {file.description}
                      </small>
                    )}
                  </div>

                  <div className="admin-user-file-actions">
                    <button
                      type="button"
                      className="adm-btn ghost"
                      onClick={() =>
                        handlePreviewFile(file)
                      }
                      disabled={isBusy}
                    >
                      {previewLoadingPath === path
                        ? "여는 중..."
                        : "미리보기"}
                    </button>

                    <button
                      type="button"
                      className="adm-btn ghost"
                      onClick={() =>
                        handleDownloadFile(file)
                      }
                      disabled={isBusy}
                    >
                      {downloadLoadingPath === path
                        ? "다운로드 중..."
                        : "다운로드"}
                    </button>

                    <button
                      type="button"
                      className="adm-btn danger"
                      onClick={() =>
                        handleDeleteFile(file)
                      }
                      disabled={isBusy}
                    >
                      {deleteLoadingPath === path
                        ? "삭제 중..."
                        : "삭제"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}