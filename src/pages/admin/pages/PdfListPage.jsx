import { useEffect, useMemo, useState } from "react";
import {
  getRagFiles,
  getRagFileSignedUrl,
  deleteRagFile,
} from "../../../api/adminApi";

const FOLDER_OPTIONS = [
  { label: "통합 챗봇", value: "normal", group: "통합" },
  { label: "인사", value: "human", group: "심화" },
  { label: "노무", value: "labor", group: "심화" },
  { label: "회계", value: "accounting", group: "심화" },
  { label: "법무", value: "law", group: "심화" },
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

function getFilePath(folder, fileName) {
  return `${folder}/${fileName}`;
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

export default function PdfListPage() {
  const [selectedFolder, setSelectedFolder] = useState("normal");
  const [filesByFolder, setFilesByFolder] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      folder,
      limit: 100,
      offset: 0,
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
        path: getFilePath(selectedFolder, file.name),
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
        path: getFilePath(selectedFolder, file.name),
        expiresIn: 600,
      });

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
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

      await deleteRagFile(getFilePath(selectedFolder, file.name));

      setSuccess("파일이 삭제되었습니다.");

      await fetchSelectedFolderFiles();
    } catch (err) {
      setError(err.message || "파일 삭제에 실패했습니다.");
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

        <button
          type="button"
          className="adm-btn ghost"
          onClick={fetchAllFolders}
          disabled={isLoading}
        >
          {isLoading ? "조회 중..." : "새로고침"}
        </button>
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

            <button
              type="button"
              className="adm-btn ghost"
              onClick={fetchSelectedFolderFiles}
              disabled={isLoading}
            >
              선택 폴더 조회
            </button>
          </div>
        }
      >
        <div className="admin-file-summary">
          <strong>{getFolderLabel(selectedFolder)}</strong>
          <span>
            {getFolderGroup(selectedFolder)} 자료 · {selectedFiles.length}개
          </span>
        </div>

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
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {selectedFiles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-file-empty">
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
                    <td>{formatDate(file.created_at || file.updated_at)}</td>
                    <td>{formatFileSize(file.metadata?.size)}</td>
                    <td>{file.metadata?.mimetype || "-"}</td>

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