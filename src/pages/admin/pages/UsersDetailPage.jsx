import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAdminUsers } from "../../../api/adminApi";
import {
  deleteClientFile,
  getClientFiles,
  getClientFileSignedUrl,
} from "../../../api/clientFileApi";

import "./UsersDetailPage.css";

// --- Helper Functions ---
function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

function getFilePath(file) {
  return file.storagePath || file.path || "";
}

export default function UsersDetailPage() {
  const { uuid: encodedUuid } = useParams();
  const uuid = useMemo(
    () => decodeURIComponent(encodedUuid || ""),
    [encodedUuid],
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [clientFiles, setClientFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [previewLoadingPath, setPreviewLoadingPath] = useState(null);
  const [downloadLoadingPath, setDownloadLoadingPath] = useState(null);
  const [deleteLoadingPath, setDeleteLoadingPath] = useState(null);

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
        const data = await getAdminUsers({ limit, offset });
        const users = Array.isArray(data.users) ? data.users : [];

        matchedUser =
          users.find((user) => String(user.uuid) === String(uuid)) || null;

        const total = Number(data.total);
        if (Number.isFinite(total) && total > 0) {
          offset += limit;
          hasMore = offset < total;
        } else {
          hasMore = users.length === limit;
          offset += limit;
        }
      }

      if (!matchedUser) throw new Error("해당 사용자 정보를 찾을 수 없습니다.");
      setSelectedUser(matchedUser);
    } catch (err) {
      setSelectedUser(null);
      setError(err.message || "사용자 정보를 불러오지 못했습니다.");
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

      const files = Array.isArray(data.files) ? data.files : [];
      const sortedFiles = [...files].sort((a, b) => {
        const dateA = new Date(a.uploadedAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.uploadedAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      setClientFiles(sortedFiles);
    } catch (err) {
      setClientFiles([]);
      setError(err.message || "사용자 파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedUser();
    fetchUserFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleRefresh = async () => {
    setSuccess("");
    await Promise.all([fetchSelectedUser(), fetchUserFiles()]);
  };

  const handlePreviewFile = async (file) => {
    const path = getFilePath(file);
    if (!path) {
      setError("미리보기할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      setError("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
      return;
    }

    previewWindow.document.title = "파일 미리보기";
    previewWindow.document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; font-family: sans-serif; color: #555;">
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

      if (!data.signedUrl) throw new Error("미리보기 URL을 받지 못했습니다.");

      previewWindow.opener = null;
      previewWindow.location.replace(data.signedUrl);
    } catch (err) {
      previewWindow.close();
      setError(err.message || "파일 미리보기에 실패했습니다.");
    } finally {
      setPreviewLoadingPath(null);
    }
  };

  const handleDownloadFile = async (file) => {
    const path = getFilePath(file);
    if (!path) {
      setError("다운로드할 파일 경로를 찾을 수 없습니다.");
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

      if (!data.signedUrl) throw new Error("다운로드 URL을 받지 못했습니다.");

      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error("파일 데이터를 불러오지 못했습니다.");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        data.downloadName || file.originalName || file.fileName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message || "파일 다운로드에 실패했습니다.");
    } finally {
      setDownloadLoadingPath(null);
    }
  };

  const handleDeleteFile = async (file) => {
    const path = getFilePath(file);
    if (!path) {
      setError("삭제할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    const displayName = file.fileName || file.originalName || "파일";
    const ok = window.confirm(
      `"${displayName}"을 삭제하시겠습니까?\n\n관리자가 삭제하면 사용자의 마이페이지에서도 제거됩니다.`,
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
      if (!data.success)
        throw new Error(data.message || "파일 삭제에 실패했습니다.");

      setClientFiles((prev) =>
        prev.filter((item) => getFilePath(item) !== path),
      );
      setSuccess("사용자 파일이 삭제되었습니다.");
    } catch (err) {
      setError(err.message || "파일 삭제에 실패했습니다.");
    } finally {
      setDeleteLoadingPath(null);
    }
  };

  return (
    <main className="adm-main admin-user-detail-page">
      <section className="page-header">
        <h1 className="page-title">사용자 정보 조회</h1>
        <Link to="/admin/users" className="adm-btn-back">
          사용자 목록으로
        </Link>
      </section>

      {/* 글로벌 에러 및 성공 메시지 */}
      {error && <p className="login-error text-danger">{error}</p>}
      {success && <p className="login-success text-primary">{success}</p>}

      {/* 2. 사용자 정보 박스 */}
      <section className="adm-card info-card mb-2">
        <h2 className="file-list-title">사용자 정보</h2>
        <br></br>
        {isUserLoading ? (
          <p>사용자 정보를 불러오는 중입니다...</p>
        ) : selectedUser ? (
          <div className="info-card-content">
            <div className="info-row">
              <span className="info-label">이름:</span>
              <span>{selectedUser.username || "-"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">이메일:</span>
              <span>{selectedUser.email || "-"}</span>
            </div>
          </div>
        ) : (
          <p>사용자를 찾을 수 없습니다.</p>
        )}
      </section>

      {/* 3. 파일 목록 섹션 */}
      <section className="adm-card">
        <div className="file-list-header">
          <div>
            <h2 className="file-list-title">업로드 파일 목록</h2>
            <p className="file-count">
              총 {clientFiles.length}개의 파일을 업로드했습니다.
            </p>
          </div>

          <button
            type="button"
            className="adm-btn ghost"
            onClick={handleRefresh}
            disabled={isLoading || isUserLoading}
          >
            {isLoading || isUserLoading ? "조회 중..." : "새로고침"}
          </button>
        </div>

        {/* 4. 파일 목록 테이블 */}
        {isLoading ? (
          <div className="reserve-empty-box text-center p-2 border">
            파일을 불러오는 중입니다...
          </div>
        ) : clientFiles.length === 0 ? (
          <div className="reserve-empty-box text-center p-2 border">
            업로드한 파일이 없습니다.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="file-table">
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>용량</th>
                  <th>업로드 시간</th>
                  <th>설명</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {clientFiles.map((file) => {
                  const path = getFilePath(file);
                  const displayName =
                    file.fileName || file.originalName || "이름 없는 파일";
                  const isBusy =
                    previewLoadingPath === path ||
                    downloadLoadingPath === path ||
                    deleteLoadingPath === path;

                  return (
                    <tr key={file.id || path}>
                      <td>{displayName}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>
                        {formatDateTime(file.uploadedAt || file.updatedAt)}
                      </td>
                      <td>{file.description || "-"}</td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handlePreviewFile(file)}
                          disabled={isBusy}
                          title="미리보기"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => handleDownloadFile(file)}
                          disabled={isBusy}
                          title="다운로드"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() => handleDeleteFile(file)}
                          disabled={isBusy}
                          title="삭제"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
