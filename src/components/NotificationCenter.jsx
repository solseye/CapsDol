import { useEffect, useRef, useState } from "react";
import { notificationEvents } from "../utils/notifications";
import { getCurrentLanguage, translate } from "../i18n/translations";
import "../styles/notifications.css";

export default function NotificationCenter() {
  const language = getCurrentLanguage();
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    const handleNotify = ({ detail }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-2), { id, ...detail }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3600);
    };

    const handleConfirm = ({ detail }) => setConfirmation(detail);

    window.addEventListener(notificationEvents.notify, handleNotify);
    window.addEventListener(notificationEvents.confirm, handleConfirm);
    return () => {
      window.removeEventListener(notificationEvents.notify, handleNotify);
      window.removeEventListener(notificationEvents.confirm, handleConfirm);
    };
  }, []);

  useEffect(() => {
    if (!confirmation) return undefined;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        confirmation.resolve(false);
        setConfirmation(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmation]);

  const closeConfirmation = (value) => {
    confirmation?.resolve(value);
    setConfirmation(null);
  };

  return (
    <>
      <div className="notification-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`notification-toast is-${toast.type}`} key={toast.id}>
            <span aria-hidden="true">{toast.type === "error" ? "!" : "✓"}</span>
            <p>{toast.message}</p>
            <button
              type="button"
              aria-label={translate(language, "common.closeNotification")}
              onClick={() =>
                setToasts((current) => current.filter((item) => item.id !== toast.id))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {confirmation && (
        <div
          className="notification-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirmation(false);
          }}
        >
          <section
            className="notification-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="notification-confirm-title"
          >
            <p>CONFIRM</p>
            <h2 id="notification-confirm-title">{confirmation.title}</h2>
            <span>{confirmation.message}</span>
            <div>
              <button type="button" onClick={() => closeConfirmation(false)}>
                {confirmation.cancelLabel}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                className={confirmation.tone === "danger" ? "is-danger" : ""}
                onClick={() => closeConfirmation(true)}
              >
                {confirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
