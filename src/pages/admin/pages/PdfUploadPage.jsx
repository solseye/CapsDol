import { useState } from "react";
import { uploadRagFile } from "../../../api/adminApi";

const FOLDER_OPTIONS = [
  { label: "통합 챗봇", value: "normal" },
  { label: "인사", value: "human" },
  { label: "노무", value: "labor" },
  { label: "회계", value: "accounting" },
  { label: "법무", value: "law" },
];

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.csv,.txt,.md";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "xlsx", "csv", "txt", "md"];

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

function isAllowedFile(file) {
  if (!file) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();

  return ALLOWED_EXTENSIONS.includes(extension);
}

export default function PdfUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("normal");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("대기 중");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const selectedFolderLabel =
    FOLDER_OPTIONS.find((option) => option.value === selectedFolder)?.label ||
    "통합 챗봇";

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("업로드할 파일을 먼저 선택해 주세요.");
      setSuccess("");
      return;
    }

    if (!isAllowedFile(selectedFile)) {
      setError("업로드 가능한 파일 형식은 PDF, DOCX, XLSX, CSV, TXT, MD입니다.");
      setSuccess("");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccess("");
      setStatus("업로드 중");
      setProgress(35);

      const data = await uploadRagFile({
        bucket: "chat",
        folder: selectedFolder,
        file: selectedFile,
        fileStatus: "active",
      });

      setProgress(100);
      setStatus("업로드 완료");
      setSuccess(
        `${data.file?.originalName || selectedFile.name} 파일이 업로드되었습니다.`
      );
      setSelectedFile(null);
    } catch (err) {
      setProgress(0);
      setStatus("업로드 실패");
      setError(err.message || "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Knowledge Base</p>
          <h2>자료 업로드</h2>
          <span>챗봇이 참고할 자료 파일을 등록합니다.</span>
        </div>
      </div>

      <AdminCard title="자료 파일 추가">
        <div className="adm-upload-box">
          <div className="adm-upload-icon">FILE</div>

          <h3>파일을 선택해 주세요</h3>

          <div className="adm-upload-field">

            <div className="custom-select">
              <button
                type="button"
                className={`custom-select-trigger ${
                  isFolderOpen ? "open" : ""
                }`}
                onClick={() => setIsFolderOpen((prev) => !prev)}
                disabled={isUploading}
              >
                {selectedFolderLabel}
                <span>▾</span>
              </button>

              {isFolderOpen && (
                <div className="custom-select-menu">
                  {FOLDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`custom-select-option ${
                        selectedFolder === option.value ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedFolder(option.value);
                        setIsFolderOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className="adm-file-picker">
            파일 선택
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;

                if (file && !isAllowedFile(file)) {
                  setSelectedFile(null);
                  setProgress(0);
                  setStatus("대기 중");
                  setSuccess("");
                  setError(
                    "업로드 가능한 파일 형식은 PDF, DOCX, XLSX, CSV, TXT, MD입니다."
                  );
                  event.target.value = "";
                  return;
                }

                setSelectedFile(file);
                setProgress(0);
                setStatus(file ? "파일 선택됨" : "대기 중");
                setError("");
                setSuccess("");
              }}
            />
          </label>

          <div className="adm-selected-file">
            {selectedFile ? selectedFile.name : "선택된 파일이 없습니다."}
          </div>

          <div className="adm-progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="adm-upload-status">{status}</div>

          {error && <p className="adm-upload-status error">{error}</p>}
          {success && <p className="adm-upload-status success">{success}</p>}

          <button
            type="button"
            className="adm-btn primary"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </div>
      </AdminCard>
    </div>
  );
}