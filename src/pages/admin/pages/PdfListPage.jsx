import { useEffect, useMemo, useState } from "react";
import {
  getRagFiles,
  getRagFileSignedUrl,
  deleteRagFile,
  updateRagFileStatus,
  createRagIndex,
} from "../../../api/adminApi";

const FOLDER_OPTIONS = [
  { label: "통합 챗봇", value: "normal", group: "통합" },
  { label: "인사", value: "human", group: "심화" },
  { label: "노무", value: "labor", group: "심화" },
  { label: "회계", value: "accounting", group: "심화" },
  { label: "법무", value: "law", group: "심화" },
];

const FILE_STATUS_OPTIONS = [
  { label: "사용 중", value: "active" },
  { label: "사용 안 함", value: "inactive" },
  { label: "예약 자료", value: "future" },
  { label: "보관됨", value: "archived" },
];

function AdminCard({ title, action, children }) {
  return (
    <section className="adm-card">
      <div className="adm-card-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("ko-KR");
}

function formatFileSize(size) {
  const bytes = Number(size || 0);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFolderLabel(folder) {
  return FOLDER_OPTIONS.find((item) => item.value === folder)?.label || folder;
}

function getFolderGroup(folder) {
  return FOLDER_OPTIONS.find((item) => item.value === folder)?.group || "-";
}

function getDisplayFileName(fileName) {
  return String(fileName || "").replace(/^\d+-/, "");
}

function getFilePath(file, folder) {
  return file.path || `${folder}/${file.name}`;
}

export default function PdfListPage() {
  const [selectedFolder, setSelectedFolder] = useState("normal");
  const [filesByFolder, setFilesByFolder] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState(null);

  const selectedFiles = filesByFolder[selectedFolder] || [];

  const allFiles = useMemo(() => {
    return Object.entries(filesByFolder).flatMap(([folder, files]) =>
      files.map((file) => ({
        ...file,
        folder,
      }))
    );
  }, [filesByFolder]);

  const fetchFilesByFolder = async (folder) => {
    const data = await getRagFiles({
      bucket: "chat",
      folder,
    });

    return data.files || [];
  };

  const fetchSelectedFolderFiles = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const files = await fetchFilesByFolder(selectedFolder);

      setFilesByFolder((prev) => ({
        ...prev,
        [selectedFolder]: files,
      }));
    } catch (err) {
      setError(err.message || "파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const result = {};

      for (const option of FOLDER_OPTIONS) {
        result[option.value] = await fetchFilesByFolder(option.value);
      }

      setFilesByFolder(result);
    } catch (err) {
      setError(err.message || "파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreview = async (file) => {
    const previewWindow = window.open("", "_blank");

    try {
      setError("");
      setSuccess("");

      const data = await getRagFileSignedUrl({
        path: getFilePath(file, selectedFolder),
        expiresIn: 600,
      });

      if (previewWindow) {
        previewWindow.location.href = data.signedUrl;
      } else {
        window.location.href = data.signedUrl;
      }
    } catch (err) {
      if (previewWindow) {
        previewWindow.close();
      }

      setError(err.message || "파일 미리보기에 실패했습니다.");
    }
  };

  const handleDownload = async (file) => {
    try {
      setError("");
      setSuccess("");

      const data = await getRagFileSignedUrl({
        path: getFilePath(file, selectedFolder),
        expiresIn: 600,
      });

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getDisplayFileName(file.name);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message || "파일 다운로드에 실패했습니다.");
    }
  };

  const handleDelete = async (file) => {
    const ok = window.confirm(`${file.name} 파일을 삭제하시겠습니까?`);

    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      await deleteRagFile(getFilePath(file, selectedFolder));

      setSuccess("파일이 삭제되었습니다.");

      await fetchSelectedFolderFiles();
    } catch (err) {
      setError(err.message || "파일 삭제에 실패했습니다.");
    }
  };

  const handleChangeStatus = async (file, nextStatus) => {
    const currentStatus = file.ragMetadata?.file_status || "active";

    if (currentStatus === nextStatus) return;

    const ok = window.confirm(
      `${getDisplayFileName(file.name)} 파일 상태를 ${nextStatus}로 변경하시겠습니까?`
    );

    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      await updateRagFileStatus({
        bucket: "chat",
        path: getFilePath(file, selectedFolder),
        fileStatus: nextStatus,
        sourceName: file.ragMetadata?.source_name || "",
        sourceUrl: file.ragMetadata?.source_url || "",
        version: file.ragMetadata?.version || "",
        effectiveFrom: file.ragMetadata?.effective_from || "",
        effectiveTo: file.ragMetadata?.effective_to || "",
      });

      setSuccess("파일 상태가 변경되었습니다.");

      await fetchSelectedFolderFiles();
    } catch (err) {
      setError(err.message || "파일 상태 변경에 실패했습니다.");
    }
  };

  const handleCreateIndex = async () => {
    const folderLabel = getFolderLabel(selectedFolder);

    const ok = window.confirm(
      `${folderLabel} 자료를 기준으로 벡터 DB를 제작하시겠습니까?`
    );

    if (!ok) return;

    try {
      setIsIndexing(true);
      setError("");
      setSuccess("");
      setIndexResult(null);

      const data = await createRagIndex({
        bucket: "chat",
        prefix: selectedFolder,
      });

      setIndexResult(data);
      setSuccess("벡터 DB 제작이 완료되었습니다.");
    } catch (err) {
      setError(err.message || "벡터 DB 제작에 실패했습니다.");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">PDF Library</p>
          <h2>PDF 자료 목록</h2>
          <span>현재 챗봇에 등록된 자료를 확인합니다.</span>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn ghost2"
            onClick={fetchAllFolders}
            disabled={isLoading}
          >
            {isLoading ? "조회 중..." : "새로고침"}
          </button>

          <button
            type="button"
            className="adm-btn primary"
            onClick={handleCreateIndex}
            disabled={isIndexing || isLoading}
          >
            {isIndexing ? "제작 중..." : "벡터 DB 제작"}
          </button>
        </div>
      </div>

      {error && <section className="adm-card admin-alert error">{error}</section>}

      {success && (
        <section className="adm-card admin-alert success">{success}</section>
      )}

      <AdminCard
        title={`등록된 PDF ${allFiles.length}개`}
        action={
          <div className="admin-file-filter">
            {FOLDER_OPTIONS.map((folder) => (
              <button
                key={folder.value}
                type="button"
                className={`adm-btn ${
                  selectedFolder === folder.value ? "primary" : "ghost"
                }`}
                onClick={() => setSelectedFolder(folder.value)}
              >
                {folder.label}
              </button>
            ))}

          </div>
        }
      >
        <div className="admin-file-summary">
          <strong>{getFolderLabel(selectedFolder)}</strong>
          <span>
            {getFolderGroup(selectedFolder)} 자료 · {selectedFiles.length}개
          </span>
        </div>

        {indexResult && (
          <div className="admin-index-result">
            <strong>벡터 DB 제작 결과</strong>
            <span>전체 파일: {indexResult.fileCount ?? 0}개</span>
            <span>인덱싱 완료: {indexResult.indexedCount ?? 0}개</span>
            <span>건너뜀: {indexResult.skippedCount ?? 0}개</span>
            <span>총 청크 수: {indexResult.totalChunkCount ?? 0}개</span>
          </div>
        )}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>자료 분야</th>
                <th>파일명</th>
                <th>업로드 날짜</th>
                <th>파일 크기</th>
                <th>형식</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {selectedFiles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-file-empty">
                    등록된 PDF 자료가 없습니다.
                  </td>
                </tr>
              ) : (
                selectedFiles.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <span
                        className={`admin-file-badge ${
                          getFolderGroup(selectedFolder) === "통합"
                            ? "normal"
                            : "deep"
                        }`}
                      >
                        {getFolderGroup(selectedFolder)}
                      </span>
                    </td>

                    <td>{getFolderLabel(selectedFolder)}</td>
                    <td>{getDisplayFileName(file.name)}</td>
                    <td>{formatDate(file.created_at || file.updated_at || file.ragMetadata?.created_at)}</td>
                    <td>{formatFileSize(file.metadata?.size)}</td>
                    <td>{file.metadata?.mimetype || file.fileType || "-"}</td>
                    <td>
                      <div className="custom-select admin-file-status-dropdown">
                        <button
                          type="button"
                          className={`custom-select-trigger ${
                            openStatusMenuId === file.id ? "open" : ""
                          }`}
                          onClick={() =>
                            setOpenStatusMenuId((prev) => (prev === file.id ? null : file.id))
                          }
                        >
                          {
                            FILE_STATUS_OPTIONS.find(
                              (status) =>
                                status.value === (file.ragMetadata?.file_status || "active")
                            )?.label
                          }
                          <span>▾</span>
                        </button>

                        {openStatusMenuId === file.id && (
                          <div className="custom-select-menu">
                            {FILE_STATUS_OPTIONS.map((status) => (
                              <button
                                key={status.value}
                                type="button"
                                className={`custom-select-option ${
                                  (file.ragMetadata?.file_status || "active") === status.value
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  setOpenStatusMenuId(null);
                                  handleChangeStatus(file, status.value);
                                }}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="admin-file-actions">
                        <button
                          type="button"
                          className="adm-btn ghost"
                          onClick={() => handlePreview(file)}
                        >
                          미리보기
                        </button>

                        <button
                          type="button"
                          className="adm-btn ghost"
                          onClick={() => handleDownload(file)}
                        >
                          다운로드
                        </button>

                        <button
                          type="button"
                          className="adm-btn danger"
                          onClick={() => handleDelete(file)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}