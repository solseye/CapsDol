import { useState } from "react";
import { mockPdfs } from "../mockData"; //

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

export default function PdfListPage() {
  const [pdfs, setPdfs] = useState(mockPdfs); //

  const handleDelete = (target) => {
    if (window.confirm(`${target.fileName} 자료를 삭제할까요?`)) {
      //
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== target.id)); //
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
        {/* 💡 변경 포인트: 외부 AdminTable 컴포넌트를 완전히 걷어내고 순수 HTML 테이블로 대체 */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>파일명</th>
                <th>업로드 날짜</th>
                <th>파일 크기</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {pdfs.map((pdf) => (
                <tr key={pdf.id}>
                  <td>{pdf.fileName}</td>
                  <td>{pdf.uploadedAt}</td>
                  <td>{pdf.size}</td>
                  <td>
                    <span
                      className={`adm-upload-status ${
                        pdf.status === "학습 완료"
                          ? "success"
                          : pdf.status === "처리 중"
                            ? "loading"
                            : "error"
                      }`}
                    >
                      {pdf.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-btn danger"
                      onClick={() => handleDelete(pdf)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
