const NOTIFY_EVENT = "wva:notify";
const CONFIRM_EVENT = "wva:confirm";

export function notify(message, type = "info") {
  window.dispatchEvent(
    new CustomEvent(NOTIFY_EVENT, {
      detail: { message: String(message), type },
    })
  );
}

export function confirmAction({
  title = "확인해 주세요",
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
}) {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(CONFIRM_EVENT, {
        detail: {
          title,
          message,
          confirmLabel,
          cancelLabel,
          tone,
          resolve,
        },
      })
    );
  });
}

export const notificationEvents = {
  notify: NOTIFY_EVENT,
  confirm: CONFIRM_EVENT,
};
