import { useState } from "react";
import AdminButton from "../components/AdminButton";
import AdminCard from "../components/AdminCard";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import { mockPdfs } from "../mockData";

const columns = [
  { key: "fileName", label: "파일명" },
  { key: "uploadedAt", label: "업로드 날짜" },
  { key: "size", label: "파일 크기" },
  { key: "status", label: "상태" },
];

export default function PdfListPage() {
  const [pdfs, setPdfs] = useState(mockPdfs);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = (target) => {
    // 기존 브라우저 confirm 삭제 방식입니다.
    // if (window.confirm(`${target.fileName} 자료를 삭제할까요?`)) {
    //   setPdfs((prev) => prev.filter((pdf) => pdf.id !== target.id));
    // }

    // 변경 이유: ADMIN 화면 안에서 삭제 확인 모달을 보여주면 어떤 파일을 지우는지 더 명확합니다.
    setDeleteTarget(target);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">PDF Library</p>
          <h2>PDF 자료 목록</h2>
          <span>현재 챗봇에 등록된 자료를 확인합니다.</span>
        </div>
      </div>

      <AdminCard title={`등록된 PDF ${pdfs.length}개`}>
        <AdminTable
          columns={columns}
          rows={pdfs}
          renderActions={(row) => (
            <AdminButton variant="danger" onClick={() => handleDelete(row)}>
              삭제
            </AdminButton>
          )}
        />
      </AdminCard>

      {deleteTarget && (
        <AdminModal title="PDF 삭제 확인" onClose={() => setDeleteTarget(null)}>
          <div className="adm-confirm">
            <p>
              <strong>{deleteTarget.fileName}</strong> 자료를 삭제할까요?
            </p>
            <span>삭제 후에는 목록에서 바로 사라집니다.</span>
            <div className="adm-confirm-actions">
              <AdminButton variant="ghost" onClick={() => setDeleteTarget(null)}>
                취소
              </AdminButton>
              <AdminButton variant="danger" onClick={confirmDelete}>
                삭제
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
