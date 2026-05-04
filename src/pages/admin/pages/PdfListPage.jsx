import { useState } from "react";
import AdminButton from "../components/AdminButton";
import AdminCard from "../components/AdminCard";
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

  const handleDelete = (target) => {
    if (window.confirm(`${target.fileName} 자료를 삭제할까요?`)) {
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== target.id));
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
    </div>
  );
}
