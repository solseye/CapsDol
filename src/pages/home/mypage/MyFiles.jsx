import { useEffect, useRef, useState } from "react";
import Header from "../../../components/Header";
import "../../../App.css";
import "../../admin/admin.css";

import {
  deleteClientFile,
  getClientFiles,
  getClientFileSignedUrl,
  uploadClientFile,
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

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR");
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

function getFilePath(file) {
  return file.storagePath || file.path || "";
}

export default function MyFiles() {
  const fileInputRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [clientFiles, setClientFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");

  const [isFileListLoading, setIsFileListLoading] =
    useState(true);

  const [isUploading, setIsUploading] = useState(false);

  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [deleteLoadingPath, setDeleteLoadingPath] =
    useState(null);

  const [previewLoadingPath, setPreviewLoadingPath] =
    useState(null);

  const [downloadLoadingPath, setDownloadLoadingPath] =
    useState(null);

  const fetchClientFiles = async () => {
    try {
      setIsFileListLoading(true);
      setFileError("");

      const data = await getClientFiles({
        bucket: "users",
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
      setFileError(
        err.message || "파일 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsFileListLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);

    if (token) {
      fetchClientFiles();
    } else {
      setIsFileListLoading(false);
      setFileError("로그인이 필요한 페이지입니다.");
    }
  }, []);

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFileName("");
    setDescription("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setUploadError("");
    setUploadMessage("");

    // 파일 명칭이 비어 있을 때만 원본 파일명을 기본값으로 설정
    if (file && !fileName.trim()) {
      const lastDotIndex = file.name.lastIndexOf(".");

      const nameWithoutExtension =
        lastDotIndex > 0
          ? file.name.slice(0, lastDotIndex)
          : file.name;

      setFileName(nameWithoutExtension);
    }
  };

  const handleClearSelectedFile = () => {
    resetUploadForm();
    setUploadError("");
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("업로드할 파일을 먼저 선택해 주세요.");
      setUploadMessage("");
      return;
    }

    if (!fileName.trim()) {
      setUploadError("파일 명칭을 입력해 주세요.");
      setUploadMessage("");
      return;
    }

    if (!description.trim()) {
      setUploadError("파일 설명을 입력해 주세요.");
      setUploadMessage("");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      setUploadMessage("");

      const data = await uploadClientFile({
        file: selectedFile,
        fileName,
        description,
        bucket: "users",
      });

      if (data.success) {
        setUploadMessage("파일이 성공적으로 업로드되었습니다.");

        resetUploadForm();

        await fetchClientFiles();
      }
    } catch (err) {
      setUploadError(
        err.message || "파일 업로드에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

    const handleDeleteFile = async (file) => {
    const path = file.storagePath || file.path;

    if (!path) {
      setFileError("삭제할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    const ok = window.confirm(
      `"${file.fileName || file.originalName || "파일"}"을 삭제하시겠습니까?`
    );

    if (!ok) return;

    try {
      setFileError("");
      setDeleteLoadingPath(path);

      const data = await deleteClientFile({
        bucket: file.bucket || "users",
        path,
      });

      if (data.success) {
        setClientFiles((prev) =>
          prev.filter(
            (item) =>
              (item.storagePath || item.path) !== path
          )
        );
      }
    } catch (err) {
      setFileError(
        err.message || "파일 삭제에 실패했습니다."
      );
    } finally {
      setDeleteLoadingPath(null);
    }
  };

  const handlePreviewFile = async (file) => {
    const path = getFilePath(file);

    if (!path) {
      setFileError("미리보기할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    // API 요청 전에 빈 창을 먼저 열어 팝업 차단을 방지한다.
    // 여기에는 noopener,noreferrer를 넣지 않는다.
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setFileError(
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
      setFileError("");
      setPreviewLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: false,
      });

      if (!data.signedUrl) {
        throw new Error("미리보기 URL을 받지 못했습니다.");
      }

      previewWindow.opener = null;
      previewWindow.location.replace(data.signedUrl);
    } catch (err) {
      previewWindow.close();

      setFileError(
        err.message || "파일 미리보기에 실패했습니다."
      );
    } finally {
      setPreviewLoadingPath(null);
    }
  };

    const handleDownloadFile = async (file) => {
    const path = getFilePath(file);

    if (!path) {
      setFileError("다운로드할 파일 경로를 찾을 수 없습니다.");
      return;
    }

    try {
      setFileError("");
      setDownloadLoadingPath(path);

      const data = await getClientFileSignedUrl({
        bucket: file.bucket || "users",
        path,
        expiresIn: 600,
        download: true,
      });

      if (!data.signedUrl) {
        throw new Error("다운로드 URL을 받지 못했습니다.");
      }

      const response = await fetch(data.signedUrl);

      if (!response.ok) {
        throw new Error("파일 데이터를 불러오지 못했습니다.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

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
      setFileError(
        err.message || "파일 다운로드에 실패했습니다."
      );
    } finally {
      setDownloadLoadingPath(null);
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <main className="reserve-page mypage mypage-files-page">
        <section className="reserve-hero">
          <p className="adm-eyebrow">My Files</p>
          <h2>내 파일 관리</h2>

          <span>
            상담에 필요한 파일을 제출하고 관리합니다.
          </span>
        </section>

        <section className="adm-card mypage-upload-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-eyebrow">File Upload</p>
              <h2>파일 업로드</h2>
            </div>
          </div>

          <div className="mypage-upload-box">
            <div className="mypage-upload-icon">
              FILE
            </div>

            <div className="mypage-upload-description">
              <h3>
                상담에 필요한 파일을 제출해 주세요
              </h3>

              <p>
                파일을 선택한 뒤 화면에 표시할 파일 명칭과
                설명을 입력해 주세요.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileChange}
            />

            <div className="mypage-upload-actions">
              <button
                type="button"
                className="adm-btn ghost"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isUploading}
              >
                파일 선택
              </button>

              {selectedFile && (
                <button
                  type="button"
                  className="adm-btn ghost"
                  onClick={handleClearSelectedFile}
                  disabled={isUploading}
                >
                  선택 취소
                </button>
              )}
            </div>

            <div className="adm-selected-file">
              {selectedFile
                ? `${selectedFile.name} · ${formatFileSize(
                    selectedFile.size
                  )}`
                : "선택된 파일이 없습니다."}
            </div>

            <div className="mypage-upload-form">
              <label className="mypage-upload-field">
                <span>
                  파일 명칭 <strong>*</strong>
                </span>

                <input
                  type="text"
                  value={fileName}
                  onChange={(event) =>
                    setFileName(event.target.value)
                  }
                  placeholder="사용자에게 표시할 파일 명칭"
                  disabled={isUploading}
                  maxLength={200}
                />
              </label>

              <label className="mypage-upload-field">
                <span>
                  파일 설명 <strong>*</strong>
                </span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="파일에 대한 설명을 입력해 주세요."
                  disabled={isUploading}
                  rows={4}
                  maxLength={1000}
                />
              </label>
            </div>

            {uploadError && (
              <p className="login-error">
                {uploadError}
              </p>
            )}

            {uploadMessage && (
              <p className="login-success">
                {uploadMessage}
              </p>
            )}

            <button
              type="button"
              className="adm-btn primary"
              onClick={handleUpload}
              disabled={
                isUploading ||
                !selectedFile ||
                !fileName.trim() ||
                !description.trim()
              }
            >
              {isUploading ? "업로드 중..." : "업로드"}
            </button>
          </div>
        </section>

        <section className="adm-card mypage-file-card">
          <div className="adm-card-head">
            <div>
              <p className="adm-eyebrow">
                Uploaded Files
              </p>

              <h2>업로드된 파일</h2>
            </div>

            <button
              type="button"
              className="adm-btn ghost"
              onClick={fetchClientFiles}
              disabled={isFileListLoading || isUploading}
            >
              {isFileListLoading
                ? "조회 중..."
                : "새로고침"}
            </button>
          </div>

          {fileError && (
            <p className="login-error">
              {fileError}
            </p>
          )}

          {isFileListLoading ? (
            <div className="reserve-empty-box">
              파일 목록을 불러오는 중입니다.
            </div>
          ) : clientFiles.length === 0 ? (
            <div className="reserve-empty-box">
              아직 업로드한 파일이 없습니다.
            </div>
          ) : (
            <div className="mypage-file-list">
              {clientFiles.map((file) => {
                const displayName =
                  file.fileName ||
                  file.originalName ||
                  "이름 없는 파일";

                const originalName =
                  file.originalName || "-";

                return (
                  <article
                    key={file.id || getFilePath(file)}
                    className="mypage-file-item"
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
                          file.uploadedAt || file.updatedAt
                        )}
                      </span>

                      {file.description && (
                        <small>
                          설명: {file.description}
                        </small>
                      )}
                    </div>

                    <div className="mypage-file-actions">
                      <button
                        type="button"
                        className="adm-btn ghost"
                        onClick={() => handlePreviewFile(file)}
                        disabled={
                          previewLoadingPath === getFilePath(file) ||
                          downloadLoadingPath === getFilePath(file) ||
                          deleteLoadingPath === getFilePath(file)
                        }
                      >
                        {previewLoadingPath === getFilePath(file)
                          ? "여는 중..."
                          : "미리보기"}
                      </button>

                      <button
                        type="button"
                        className="adm-btn ghost"
                        onClick={() => handleDownloadFile(file)}
                        disabled={
                          previewLoadingPath === getFilePath(file) ||
                          downloadLoadingPath === getFilePath(file) ||
                          deleteLoadingPath === getFilePath(file)
                        }
                      >
                        {downloadLoadingPath === getFilePath(file)
                          ? "다운로드 중..."
                          : "다운로드"}
                      </button>

                      <button
                        type="button"
                        className="adm-btn danger"
                        onClick={() => handleDeleteFile(file)}
                        disabled={
                          previewLoadingPath === getFilePath(file) ||
                          downloadLoadingPath === getFilePath(file) ||
                          deleteLoadingPath === getFilePath(file)
                        }
                      >
                        {deleteLoadingPath === getFilePath(file)
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
    </>
  );
}
