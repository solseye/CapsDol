import AdminButton from "./AdminButton";

export default function AdminModal({ title, children, onClose }) {
  return (
    <div className="adm-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="adm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <AdminButton variant="ghost" className="adm-icon-btn" onClick={onClose}>
            닫기
          </AdminButton>
        </div>
        {children}
      </div>
    </div>
  );
}
