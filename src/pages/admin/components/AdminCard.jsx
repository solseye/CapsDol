// 관리자 화면에서 반복되는 카드 헤더와 본문 구조를 통일합니다.
export default function AdminCard({
  title,
  children,
  className = "",
  headerRight,
}) {
  return (
    <section className={`adm-card ${className}`}>
      <div className="adm-card-head">
        <div className="adm-card-title-group">
          <h2>{title}</h2>
          {headerRight && (
            <div className="adm-card-head-right">{headerRight}</div>
          )}
        </div>
      </div>
      <div className="adm-card-body">{children}</div>
    </section>
  );
}
