import { useEffect, useMemo, useRef, useState } from "react";
import RequiredDocumentsManager from "./RequiredDocumentsManager";
import "../../../App.css";
import "../../admin/admin.css";
import "../../../styles/my-files-visily.css";
import "../../../styles/required-documents.css";
import "../../../styles/mypage-transition.css";

import {
  deleteClientFile,
  getClientFiles,
  getClientFileSignedUrl,
  uploadClientFile,
} from "../../../api/clientFileApi";
import {
  REQUIRED_DOCUMENT_GROUPS,
  ensureRequiredDocumentsChecklist,
  saveRequiredDocumentsChecklist,
} from "../../../utils/requiredDocumentsStorage";
import { markWorkflowEvent } from "../../../utils/workflowProgress";
import { confirmAction } from "../../../utils/notifications";

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

  if (lastDotIndex >= 0 && lastDotIndex < fileName.length - 1) {
    return fileName.slice(lastDotIndex + 1).toUpperCase();
  }

  if (fileType === "application/pdf") {
    return "PDF";
  }

  if (fileType?.includes("word")) {
    return "DOCX";
  }

  if (fileType?.includes("spreadsheet") || fileType?.includes("excel")) {
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


  const [clientFiles, setClientFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");

  const [isFileListLoading, setIsFileListLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);

  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [deleteLoadingPath, setDeleteLoadingPath] = useState(null);

  const [previewLoadingPath, setPreviewLoadingPath] = useState(null);

  const [downloadLoadingPath, setDownloadLoadingPath] = useState(null);
  const [requiredDocumentType, setRequiredDocumentType] = useState("");
  const [, setRequiredDocumentsChecklist] = useState(null);

  const fetchClientFiles = async () => {
    try {
      setIsFileListLoading(true);
      setFileError("");

      const data = await getClientFiles({
        bucket: "users",
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
      return sortedFiles;
    } catch (err) {
      setFileError(err.message || "파일 목록을 불러오지 못했습니다.");
      return [];
    } finally {
      setIsFileListLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setRequiredDocumentsChecklist(ensureRequiredDocumentsChecklist());
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
    setRequiredDocumentType("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateRequiredDocuments = (updater) => {
    setRequiredDocumentsChecklist((current) => {
      if (!current) return current;
      return saveRequiredDocumentsChecklist(updater(current));
    });
  };

  const getRequiredDocumentSelection = (value) => {
    if (!value) return null;
    const [groupId, itemId] = value.split(":");
    if (!groupId || !itemId) return null;
    return { groupId, itemId };
  };

  const markRequiredDocumentUploaded = (selectionValue, uploadedFile) => {
    const selection = getRequiredDocumentSelection(selectionValue);
    if (!selection) return;

    updateRequiredDocuments((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === selection.groupId
          ? {
              ...group,
              items: group.items.map((item) =>
                item.id === selection.itemId
                  ? {
                      ...item,
                      status: "uploaded",
                      linkedFileName:
                        uploadedFile?.fileName ||
                        uploadedFile?.originalName ||
                        selectedFile?.name ||
                        fileName.trim(),
                      linkedFilePath:
                        uploadedFile?.storagePath || uploadedFile?.path || "",
                      updatedAt: new Date().toISOString(),
                    }
                  : item,
              ),
            }
          : group,
      ),
    }));
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
        lastDotIndex > 0 ? file.name.slice(0, lastDotIndex) : file.name;

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
        markWorkflowEvent("fileUploadedAt", new Date().toISOString());

        const refreshedFiles = await fetchClientFiles();
        const uploadedFile =
          data.file ||
          data.data ||
          refreshedFiles.find(
            (file) =>
              file.fileName === fileName.trim() ||
              file.originalName === selectedFile.name,
          );

        markRequiredDocumentUploaded(requiredDocumentType, uploadedFile);
        resetUploadForm();
      }
    } catch (err) {
      setUploadError(err.message || "파일 업로드에 실패했습니다.");
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

    const ok = await confirmAction({
      title: "파일을 삭제할까요?",
      message: `"${file.fileName || file.originalName || "파일"}"은 삭제 후 복구할 수 없습니다.`,
      confirmLabel: "삭제",
      tone: "danger",
    });

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
          prev.filter((item) => (item.storagePath || item.path) !== path),
        );

        updateRequiredDocuments((current) => ({
          ...current,
          groups: current.groups.map((group) => ({
            ...group,
            items: group.items.map((item) =>
              item.linkedFilePath === path
                ? {
                    ...item,
                    status: item.status === "uploaded" ? "ready" : item.status,
                    linkedFileName: "",
                    linkedFilePath: "",
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          })),
        }));
      }
    } catch (err) {
      setFileError(err.message || "파일 삭제에 실패했습니다.");
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
      setFileError("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
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

      setFileError(err.message || "파일 미리보기에 실패했습니다.");
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
        data.downloadName || file.originalName || file.fileName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setFileError(err.message || "파일 다운로드에 실패했습니다.");
    } finally {
      setDownloadLoadingPath(null);
    }
  };

  const recentFileCount = clientFiles.filter((file) => {
    const uploadedAt = new Date(
      file.uploadedAt || file.updatedAt || 0,
    ).getTime();

    return (
      Number.isFinite(uploadedAt) &&
      Date.now() - uploadedAt <= 7 * 24 * 60 * 60 * 1000
    );
  }).length;

  const requiredDocumentOptions = useMemo(
    () =>
      REQUIRED_DOCUMENT_GROUPS.flatMap((group) =>
        group.items.map((item) => ({
          value: `${group.id}:${item.id}`,
          label: `${group.title} · ${item.label}`,
        })),
      ),
    [],
  );

  return (
    <>
      <main className="my-files-page mypage-page-enter">
        <div className="my-files-shell">
          <section className="my-files-heading">
            <div>
              <p>MY FILES</p>
              <h1>내 파일 관리</h1>
              <span>
                일본 진출과 전문가 상담에 필요한 자료를 제출하고 관리합니다.
              </span>
            </div>
          </section>

          <section className="my-files-stats" aria-label="파일 현황">
            <article>
              <span>업로드한 문서</span>
              <strong>{clientFiles.length}</strong>
            </article>
            <article>
              <span>최근 7일 업로드</span>
              <strong>{recentFileCount}</strong>
            </article>
            <article>
              <span>필수 서류 안내</span>
              <strong>{requiredDocumentOptions.length}항목</strong>
            </article>
          </section>

          <div id="required-documents">
            <RequiredDocumentsManager />
          </div>

          <div className="my-files-workspace">
            <section className="my-files-panel upload-panel">
              <header className="my-files-panel-head">
                <div>
                  <p>FILE UPLOAD</p>
                  <h2>파일 업로드</h2>
                </div>
              </header>
              <div className="my-files-upload-layout">
                {selectedFile && (
                  <button
                    type="button"
                    className="my-files-clear"
                    onClick={handleClearSelectedFile}
                    disabled={isUploading}
                  >
                    선택 취소
                  </button>
                )}
              </div>

              <div className="my-files-upload-layout">
                <div className="my-files-file-picker">
                  <label
                    className={`my-files-dropzone ${
                      selectedFile ? "has-file" : ""
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <span className="my-files-drop-icon">FILE</span>
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : "상담에 필요한 파일을 이곳에 업로드해주세요"}
                    </strong>
                    <small>
                      {selectedFile
                        ? formatFileSize(selectedFile.size)
                        : "영역을 눌러 파일을 업로드 하세요."}
                    </small>
                  </label>
                  {/*
                  {selectedFile && (
                    <button
                      type="button"
                      className="my-files-clear"
                      onClick={handleClearSelectedFile}
                      disabled={isUploading}
                    >
                      선택 취소
                    </button>
                  )}
                    */}
                </div>

                <div className="my-files-upload-details">
                  <div className="my-files-form">
                    <label className="my-files-document-type">
                      <span>문서 분류</span>
                      <select
                        value={requiredDocumentType}
                        onChange={(event) =>
                          setRequiredDocumentType(event.target.value)
                        }
                        disabled={isUploading}
                      >
                        <option value="">일반 제출 문서</option>
                        {requiredDocumentOptions.map((document) => (
                          <option key={document.value} value={document.value}>
                            {document.label}
                          </option>
                        ))}
                      </select>
                      <small>
                        필수 서류 종류를 선택하면 업로드 완료 후 준비 현황에
                        자동 반영됩니다.
                      </small>
                    </label>

                    <label>
                      <span>파일 명칭 *</span>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(event) => setFileName(event.target.value)}
                        placeholder="사용자에게 표시할 파일 명칭"
                        disabled={isUploading}
                        maxLength={200}
                      />
                    </label>

                    <label>
                      <span>파일 설명 *</span>
                      <input
                        type="text"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="예: 일본 법인 설립용 사업계획서"
                        disabled={isUploading}
                        maxLength={160}
                      />
                    </label>
                  </div>

                  {uploadError && <p className="login-error">{uploadError}</p>}
                  {uploadMessage && (
                    <p className="login-success">{uploadMessage}</p>
                  )}

                  <button
                    type="button"
                    className="my-files-primary"
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
              </div>
            </section>
          </div>

          <section className="my-files-panel file-list-panel">
            <header className="my-files-panel-head">
              <div>
                <p>UPLOADED FILES</p>
                <h2>업로드된 파일</h2>
              </div>
              <button
                type="button"
                className="my-files-secondary"
                onClick={fetchClientFiles}
                disabled={isFileListLoading || isUploading}
              >
                {isFileListLoading ? "조회 중..." : "새로고침"}
              </button>
            </header>

            {fileError && <p className="login-error">{fileError}</p>}

            {isFileListLoading ? (
              <div className="my-files-empty">
                파일 목록을 불러오는 중입니다.
              </div>
            ) : clientFiles.length === 0 ? (
              <div className="my-files-empty">
                아직 업로드한 파일이 없습니다.
              </div>
            ) : (
              <div className="my-files-list">
                {clientFiles.map((file) => {
                  const displayName =
                    file.fileName || file.originalName || "이름 없는 파일";
                  const originalName = file.originalName || "-";
                  const filePath = getFilePath(file);

                  return (
                    <article
                      key={file.id || filePath}
                      className="my-files-item"
                    >
                      <span className="my-files-type">
                        {getFileTypeLabel(file.fileType, originalName)}
                      </span>
                      <div>
                        <strong>{displayName}</strong>
                        <span>
                          {formatFileSize(file.size)} ·{" "}
                          {formatDateTime(file.uploadedAt || file.updatedAt)}
                        </span>
                        {file.description && <small>{file.description}</small>}
                      </div>
                      <div className="my-files-actions">
                        <button
                          type="button"
                          onClick={() => handlePreviewFile(file)}
                          disabled={
                            previewLoadingPath === filePath ||
                            downloadLoadingPath === filePath ||
                            deleteLoadingPath === filePath
                          }
                        >
                          {previewLoadingPath === filePath
                            ? "여는 중..."
                            : "미리보기"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                          disabled={
                            previewLoadingPath === filePath ||
                            downloadLoadingPath === filePath ||
                            deleteLoadingPath === filePath
                          }
                        >
                          {downloadLoadingPath === filePath
                            ? "다운로드 중..."
                            : "다운로드"}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDeleteFile(file)}
                          disabled={
                            previewLoadingPath === filePath ||
                            downloadLoadingPath === filePath ||
                            deleteLoadingPath === filePath
                          }
                        >
                          {deleteLoadingPath === filePath
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
        </div>
      </main>
    </>
  );
}
