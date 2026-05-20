import { useState } from "react";

// 페이지 내부에서 사용할 카드 컴포넌트
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

export default function PdfUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("대기 중");

  const handleMockUpload = () => {
    if (!selectedFile) {
      setStatus("PDF 파일을 먼저 선택해 주세요.");
      return;
    }

    setStatus("업로드 준비 완료");
    setProgress(35);

    window.setTimeout(() => {
      setProgress(72);
      setStatus("자료 분석 중");
    }, 400);

    window.setTimeout(() => {
      setProgress(100);
      setStatus("업로드 완료");
    }, 900);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Knowledge Base</p>
          <h2>PDF 업로드</h2>
          <span>챗봇이 참고할 PDF 자료를 등록합니다.</span>
        </div>
      </div>

      <AdminCard title="PDF 자료 추가">
        <div className="adm-upload-box">
          <div className="adm-upload-icon">PDF</div>
          <h3>파일을 선택해 주세요</h3>
          <p>실제 업로드는 하지 않고 UI 상태만 mock으로 처리합니다.</p>

          <label className="adm-file-picker">
            파일 선택
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setProgress(0);
                setStatus(file ? "파일 선택됨" : "대기 중");
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

          {/* 💡 변경 포인트: AdminButton 대신 순수 버튼 태그와 admin.css 클래스 결합 */}
          <button
            type="button"
            className="adm-btn primary"
            onClick={handleMockUpload}
          >
            업로드
          </button>
        </div>
      </AdminCard>
    </div>
  );
}
