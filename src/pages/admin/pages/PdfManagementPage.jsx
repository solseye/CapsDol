import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRagFiles,
  getRagFileSignedUrl,
  deleteRagFile,
  updateRagFileStatus,
  createRagIndex,
  uploadRagFile,
} from "../../../api/adminApi";
import AdminCard from "../components/AdminCard";
import {
  ACCEPTED_FILE_TYPES,
  FOLDER_OPTIONS,
  STATUS_OPTIONS,
  formatBytes,
  formatDateShort,
  getFileExtension,
  isAllowedFile,
} from "../utils/pdfManagementUtils";
import "./PdfManagementPage.css";

function getRagStoragePath(file) {
  return (
    file?.storagePath ||
    file?.path ||
    (file?.folder && file?.name
      ? `${file.folder}/${file.name}`
      : "")
  );
}

// RAG 문서 업로드, 상태 변경, 인덱싱을 한 화면에서 관리합니다.
export default function PdfManagementPage() {
  // 업로드, 목록, 인덱싱, 페이지네이션 상태를 화면 단위로 묶어 관리합니다.
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("normal");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [filesByFolder, setFilesByFolder] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);

  const [selectedListCategory, setSelectedListFolder] = useState("normal");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (uploadError || uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadError("");
        setUploadSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError, uploadSuccess]);

  useEffect(() => {
    if (indexResult) {
      const timer = setTimeout(() => setIndexResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [indexResult]);

  // 단일 폴더의 서버 파일 목록을 가져옵니다.
  const fetchFilesByFolder = useCallback(async (folder) => {
    const data = await getRagFiles({
      bucket: "chat",
      folder,
      limit: 100,
      offset: 0,
    });

    return Array.isArray(data.files) ? data.files : [];
  }, []);

  // 모든 문서 카테고리를 순회해 목록 탭 데이터를 채웁니다.
  const fetchAllFolders = useCallback(async () => {
    setIsLoading(true);
    setIndexResult(null);
    setListError("");
    try {
      const result = {};
      for (const option of FOLDER_OPTIONS) {
        result[option.value] = await fetchFilesByFolder(option.value);
      }
      setFilesByFolder(result);
    } catch (error) {
      setFilesByFolder({});
      setListError(error.message || "자료 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFilesByFolder]);

  useEffect(() => {
    fetchAllFolders();
  }, [fetchAllFolders]);

  // 카테고리별 목록을 통계와 필터링에 쓰기 쉬운 단일 배열로 평탄화합니다.
  const allFiles = useMemo(() => {
    return Object.entries(filesByFolder).flatMap(([folder, files]) =>
      files.map((file) => ({ ...file, folder })),
    );
  }, [filesByFolder]);

  // 선택한 파일을 현재 카테고리로 업로드하고 목록을 갱신합니다.
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("업로드할 파일을 먼저 선택해 주세요.");
      return;
    }
    if (!isAllowedFile(selectedFile)) {
      setUploadError("업로드 가능한 파일 형식이 아닙니다.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      setUploadSuccess("");
      setProgress(40);

      const data = await uploadRagFile({
        bucket: "chat",
        folder: selectedFolder,
        file: selectedFile,
        fileStatus: "active",
      });

      setProgress(100);
      setUploadSuccess(
        `${data.file?.originalName || selectedFile.name} 파일이 성공적으로 업로드되었습니다.`,
      );
      setSelectedFile(null);
      fetchAllFolders();
    } catch (err) {
      setProgress(0);
      setUploadError(err.message || "파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 메타데이터를 유지한 채 사용 상태만 바꿉니다.
  const handleChangeStatus = async (file, nextStatus) => {
    const currentStatus =
      file.fileStatus ||
      file.ragMetadata?.file_status ||
      file.status ||
      "active";
    if (currentStatus === nextStatus) return;

    if (
      !window.confirm(
        `${String(file.name || "").replace(/^\d+-/, "")} 파일 상태를 변경하시겠습니까?`,
      )
    )
      return;

    try {
      await updateRagFileStatus({
        bucket: "chat",
        path: getRagStoragePath(file),
        fileStatus: nextStatus,
        sourceName: file.ragMetadata?.source_name || "",
        sourceUrl: file.ragMetadata?.source_url || "",
        version: file.ragMetadata?.version || "",
        effectiveFrom: file.ragMetadata?.effective_from || "",
        effectiveTo: file.ragMetadata?.effective_to || "",
      });
      alert("파일 상태가 변경되었습니다.");
      fetchAllFolders();
    } catch (err) {
      alert("파일 상태 변경에 실패했습니다: " + err.message);
    }
  };

  // 현재 선택된 카테고리 문서로 벡터 인덱스를 재생성합니다.
  const handleCreateIndex = async () => {
    if (!window.confirm("현재 자료들을 기준으로 벡터 DB를 제작하시겠습니까?"))
      return;
    try {
      setIsIndexing(true);
      setIndexResult(null);

      const targetPrefix = selectedListCategory;

      const data = await createRagIndex({
        bucket: "chat",
        prefix: targetPrefix,
      });

      setIndexResult(data);
    } catch (err) {
      alert("벡터 DB 제작에 실패했습니다: " + err.message);
    } finally {
      setIsIndexing(false);
    }
  };

  // 임시 서명 URL을 받아 새 창에서 문서를 미리 봅니다.
  const handlePreview = async (file) => {
    try {
      const data = await getRagFileSignedUrl({
        path: getRagStoragePath(file),
        expiresIn: 600,
      });
      window.open(data.signedUrl || data, "_blank");
    } catch (err) {
      alert("미리보기를 불러올 수 없습니다.");
    }
  };

  // 서명 URL로 파일을 받아 브라우저 다운로드를 실행합니다.
  const handleDownload = async (file) => {
    try {
      const data = await getRagFileSignedUrl({
        path: getRagStoragePath(file),
        expiresIn: 600,
      });
      const response = await fetch(data.signedUrl || data);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name || "download";
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  // 선택한 파일을 서버 저장소에서 삭제하고 목록을 새로고침합니다.
  const handleDelete = async (file) => {
    if (
      !window.confirm(
        `${String(file.name || "").replace(/^\d+-/, "")} 파일을 삭제하시겠습니까?`,
      )
    )
      return;
    try {
      await deleteRagFile(getRagStoragePath(file));
      fetchAllFolders();
    } catch (err) {
      alert("파일 삭제에 실패했습니다.");
    }
  };

  // 선택된 탭에 속한 파일만 표에 표시합니다.
  const displayedFiles = useMemo(() => {
    return allFiles.filter((file) => file.folder === selectedListCategory);
  }, [allFiles, selectedListCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedFiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedFiles.length / itemsPerPage) || 1;

  // 폴더 값을 표에서 쓰는 카테고리 라벨로 변환합니다.
  const getCategoryLabel = (folderValue) => {
    return (
      FOLDER_OPTIONS.find((opt) => opt.value === folderValue)?.label ||
      folderValue
    );
  };

  return (
    <div className="pdf-mgmt-container">
      
      <div className="pdf-mgmt-header">
        <div>
          <h1 className="pdf-mgmt-title">PDF 업로드 및 자료 목록</h1>
          <p className="pdf-mgmt-sub">
            상담 챗봇이 참고할 지식 문서를 업로드하고 통합 관리합니다.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="pdf-btn pdf-btn-reset"
            onClick={fetchAllFolders}
            disabled={isLoading}
          >
            {isLoading ? "조회 중..." : "새로고침"}
          </button>
          <button
            type="button"
            className="pdf-btn pdf-btn-primary"
            onClick={handleCreateIndex}
            disabled={isIndexing || isLoading}
            style={{ backgroundColor: "#2563eb" }}
          >
            {isIndexing ? "제작 중..." : "벡터 DB 제작"}
          </button>
        </div>
      </div>

      
      <div className="section-half top-section">
        <div className="upload-layout-grid">
          <AdminCard title="자료 파일 업로드" className="upload-card h-full">
            <div className="upload-box-content">
              <div className="upload-field-group">
                <label className="upload-label">분야 선택</label>
                <select
                  className="pdf-select wide-select"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  {FOLDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-field-group file-input-group">
                <label className="file-upload-btn">
                  파일 선택
                  <input
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && !isAllowedFile(file)) {
                        setUploadError("지원하지 않는 파일 형식입니다.");
                        setSelectedFile(null);
                        return;
                      }
                      setSelectedFile(file || null);
                      setUploadError("");
                      setUploadSuccess("");
                    }}
                    hidden
                  />
                </label>
                <span className="selected-filename">
                  {selectedFile ? selectedFile.name : "선택된 파일이 없습니다."}
                </span>
              </div>

              <button
                type="button"
                className="pdf-btn pdf-btn-primary"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "업로드 중..." : "업로드"}
              </button>
            </div>

            {isUploading && (
              <div className="adm-progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="upload-status-wrapper">
              {uploadError && (
                <div className="upload-status-msg error">{uploadError}</div>
              )}
              {uploadSuccess && (
                <div className="upload-status-msg success">{uploadSuccess}</div>
              )}
            </div>
          </AdminCard>

          <aside className="guide-sidebar h-full">
            <h3 className="guide-title">자료 등록 가이드</h3>
            <ul className="guide-list">
              <li>
                <strong>1. 분야 선택:</strong> 문서가 속할
                카테고리(통합/인사/노무/회계/법무)를 지정하세요.
              </li>
              <li>
                <strong>2. 지원 확장자:</strong> PDF, DOCX, XLSX, CSV, TXT, MD
                파일 첨부 가능
              </li>
              <li>
                <strong>3. 벡터 DB 반영:</strong> 업로드 완료 후 우측 상단의{" "}
                <span className="highlight-text">벡터 DB 제작</span> 버튼을
                누르면 챗봇 지식에 최신 반영됩니다.
              </li>
            </ul>
          </aside>
        </div>
      </div>

      
      <div className="section-half bottom-section">
        <section className="adm-card pdf-list-card">
          
          <div className="pdf-list-header-row">
            
            <div className="pdf-list-title-block">
              <div className="registered-pdf-title">
                등록된 PDF{" "}
                <span className="highlight-count">{allFiles.length}</span>개
              </div>
              <div className="category-sub-count">
                각 분야별 자료 {displayedFiles.length}개
              </div>
            </div>

            
            <div className="pdf-list-right-block">
              {indexResult && (
                <div className="index-result-box">
                  <strong>✅ 벡터 DB 제작 완료</strong>
                  <span>전체: {indexResult.fileCount ?? 0}개</span>
                  <span>성공: {indexResult.indexedCount ?? 0}개</span>
                  <span>건너뜀: {indexResult.skippedCount ?? 0}개</span>
                  <span>총 청크 수: {indexResult.totalChunkCount ?? 0}개</span>
                </div>
              )}

              <div className="category-button-group">
                {FOLDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`category-btn ${selectedListCategory === opt.value ? "active" : ""}`}
                    onClick={() => {
                      setSelectedListFolder(opt.value);
                      setCurrentPage(1);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {listError && (
            <div className="pdf-list-error">
              <strong>자료 목록 조회 실패</strong>
              <span>{listError}</span>
            </div>
          )}

          
          <div className="table-wrapper">
            <table className="pdf-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>카테고리</th>
                  <th>파일명</th>
                  <th style={{ width: "120px" }}>인덱싱 날짜</th>
                  <th style={{ width: "100px" }}>파일 크기</th>
                  <th style={{ width: "100px" }}>파일 형식</th>
                  <th style={{ width: "100px" }}>청크 개수</th>
                  <th style={{ width: "140px" }}>상태</th>
                  <th style={{ width: "110px" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      등록된 파일이 없습니다.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((file, index) => {
                    const currentStatus =
                      file.fileStatus ||
                      file.ragMetadata?.file_status ||
                      file.status ||
                      "active";
                    const currentStatusLabel =
                      STATUS_OPTIONS.find((s) => s.value === currentStatus)
                        ?.label || "사용중";

                    return (
                      <tr key={file.id || index}>
                        
                        <td className="col-center">
                          {getCategoryLabel(file.folder)}
                        </td>

                        
                        <td
                          className="col-filename"
                          title={String(file.name || "").replace(/^\d+-/, "")}
                        >
                          {String(file.name || "").replace(/^\d+-/, "")}
                        </td>

                        
                        <td className="col-center">
                          {formatDateShort(
                            file.indexedAt ||
                              file.createdAt ||
                              file.created_at ||
                              file.ragMetadata?.created_at
                          )}
                        </td>

                        
                        <td className="col-center">
                          {formatBytes(file.metadata?.size || file.size)}
                        </td>

                        
                        <td className="col-center">
                          <span className="file-format-badge">
                            {getFileExtension(file.name)}
                          </span>
                        </td>

                        <td className="col-center">
                          <span className="file-format-badge">
                            {Number(file.chunkCount || 0).toLocaleString("ko-KR")}
                          </span>
                        </td>

                        
                        <td className="col-center custom-td-dropdown">
                          <button
                            type="button"
                            className="table-status-trigger"
                            onClick={() =>
                              setOpenStatusMenuId(
                                openStatusMenuId === file.id ? null : file.id,
                              )
                            }
                          >
                            <span
                              className={`status-badge status-${currentStatus}`}
                            >
                              {currentStatusLabel}
                            </span>
                            <span className="chevron">▼</span>
                          </button>

                          {openStatusMenuId === file.id && (
                            <div className="table-status-menu">
                              {STATUS_OPTIONS.map((status) => (
                                <button
                                  key={status.value}
                                  type="button"
                                  className={`table-status-option ${
                                    currentStatus === status.value
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
                        </td>

                        
                        <td className="col-center">
                          <div className="action-icon-group">
                            <button
                              type="button"
                              className="icon-btn"
                              title="미리보기"
                              onClick={() => handlePreview(file)}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="다운로드"
                              onClick={() => handleDownload(file)}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              title="삭제"
                              onClick={() => handleDelete(file)}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          
          <div className="list-footer">
            <div className="footer-count-text">
              전체 자료 <strong>{displayedFiles.length}</strong>개 중{" "}
              <strong>
                {displayedFiles.length > 0 ? indexOfFirstItem + 1 : 0}-
                {Math.min(indexOfLastItem, displayedFiles.length)}
              </strong>
              개 표시중
            </div>

            <div className="pagination-group">
              <button
                type="button"
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>
              <span className="page-indicator">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="page-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
