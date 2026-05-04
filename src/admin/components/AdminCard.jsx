export default function AdminCard({ title, action, children, className = "" }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || action) && (
        <div className="adm-card-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
