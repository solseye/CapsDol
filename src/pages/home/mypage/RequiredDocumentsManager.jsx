import { useEffect, useRef, useState } from "react";
import { REQUIRED_DOCUMENT_GROUPS } from "../../../utils/requiredDocumentsStorage";

export default function RequiredDocumentsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <section
        className="required-documents-banner"
        aria-labelledby="required-documents-title"
      >
        <div className="required-documents-banner-icon" aria-hidden="true">
          ✓
        </div>
        <div>
          <h2 id="required-documents-title">필수 서류 안내</h2>
          <span>
            출자 조건별 준비 서류와 1개월 유효기간을 확인하세요.
          </span>
        </div>
        <button type="button" onClick={() => setIsOpen(true)}>
          서류 목록 확인
          <span aria-hidden="true">→</span>
        </button>
      </section>

      {isOpen && (
        <div
          className="required-documents-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            className="required-documents-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="required-documents-modal-title"
          >
            <header className="required-documents-modal-head">
              <div>
                <p>REQUIRED DOCUMENTS</p>
                <h2 id="required-documents-modal-title">필요 서류 안내</h2>
                <span>
                  본인에게 해당하는 조건의 서류를 확인해 주세요.
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="필요 서류 안내 닫기"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="required-documents-modal-notice">
              <strong>서류는 모두 발급일로부터 1개월 이내의 것</strong>을
              준비해 주세요.
            </div>

            <div className="required-documents-guide-groups">
              {REQUIRED_DOCUMENT_GROUPS.map((group, groupIndex) => (
                <article key={group.id}>
                  <div className="required-documents-guide-title">
                    <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.description}</p>
                    </div>
                  </div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.id}>{item.label}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <footer className="required-documents-modal-footer">
              <p>
                확인한 서류는 아래 파일 업로드의 ‘문서 분류’에서 선택할 수
                있습니다.
              </p>
              <button type="button" onClick={() => setIsOpen(false)}>
                확인했습니다
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
