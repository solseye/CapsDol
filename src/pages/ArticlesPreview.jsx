import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createArticles } from "../api/articleApi";
import {
  clearHearingSheetDraft,
  loadHearingSheetDraft,
} from "../utils/hearingSheetDraft";
import {
  REQUIRED_DOCUMENT_GROUPS,
  ensureRequiredDocumentsChecklist,
} from "../utils/requiredDocumentsStorage";
import { markWorkflowEvent } from "../utils/workflowProgress";
import "../App.css";
import "../styles/articles-result-visily.css";

const hasValue = (value) =>
  typeof value === "string" ? value.trim().length > 0 : Boolean(value);

const displayValue = (value) => (hasValue(value) ? value : "미입력");

const collectionValues = (value) =>
  Array.isArray(value) ? value : Object.values(value || {});

function ReviewRow({ label, value }) {
  return (
    <div className="articles-review-row">
      <dt>{label}</dt>
      <dd>{displayValue(value)}</dd>
    </div>
  );
}

function ReviewSection({ number, title, children, wide = false }) {
  return (
    <section
      className={`articles-review-section${wide ? " articles-review-section--wide" : ""}`}
    >
      <div className="articles-review-section-heading">
        <span aria-hidden="true">{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function participantTitle(participant, index) {
  const roles = [];

  if (participant?.isFounder) roles.push("발기인");
  if (participant?.isInvestor) roles.push("주주");

  return roles.length > 0
    ? `${roles.join("·")} ${index + 1}`
    : `주주 ${index + 1}`;
}

export default function ArticlesPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fallbackDraft] = useState(loadHearingSheetDraft);
  const source = location.state?.articlesData?.source || fallbackDraft?.source;
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedResult, setSubmittedResult] = useState(null);
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const [showScrollGuide, setShowScrollGuide] = useState(Boolean(source));
  const submitActionsRef = useRef(null);

  useEffect(() => {
    if (!source || submittedResult) {
      setShowScrollGuide(false);
      return undefined;
    }

    const updateScrollGuide = () => {
      const actions = submitActionsRef.current;
      setShowScrollGuide(
        Boolean(actions) &&
          actions.getBoundingClientRect().top > window.innerHeight - 90,
      );
    };

    const frameId = window.requestAnimationFrame(updateScrollGuide);
    window.addEventListener("scroll", updateScrollGuide, { passive: true });
    window.addEventListener("resize", updateScrollGuide);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollGuide);
      window.removeEventListener("resize", updateScrollGuide);
    };
  }, [source, submittedResult]);

  const handleSubmit = async () => {
    if (!source || isSubmitting || submittedResult) return;

    if (!isLoggedIn) {
      setSubmitError(
        "전송하려면 로그인이 필요합니다. 작성 내용은 브라우저에 안전하게 보관됩니다.",
      );
      navigate("/login", {
        state: { from: "/articles-result" },
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      const result = await createArticles(source);
      ensureRequiredDocumentsChecklist();
      markWorkflowEvent("hearingSubmittedAt", new Date().toISOString());
      clearHearingSheetDraft();
      setSubmittedResult(result);
    } catch (error) {
      console.error("히어링 시트 전송 실패:", error);
      setSubmitError(
        error.message || "히어링 시트 전송 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!source) {
    return (
      <>
        <main className="articles-review-page articles-review-empty">
          <div className="articles-review-container">
            <p className="articles-review-eyebrow">입력 내용 확인</p>
            <h1>확인할 히어링 시트가 없습니다.</h1>
            <p>
              히어링 시트를 작성한 뒤 입력한 내용을 다시 확인할 수 있습니다.
            </p>
            <Link className="articles-review-primary-link" to="/hearing-sheet">
              히어링 시트 작성하기
            </Link>
          </div>
        </main>
      </>
    );
  }

  const purposes = collectionValues(source.Purpose)
    .map((item) => (typeof item === "string" ? item : item?.content))
    .filter(hasValue);
  const shareholders = collectionValues(source.Founder).filter((item) =>
    [item?.name, item?.address, item?.investmentAmount].some(hasValue),
  );
  const directors = collectionValues(source.Director).filter((item) =>
    [item?.name, item?.address, item?.romanizedName].some(hasValue),
  );
  const completedCount = [
    source.companyName,
    source.companyNameEn,
    source.headOfficeAddress,
    source.capital,
    source.capitalPaymentBank?.bankName,
    source.capitalPaymentBank?.branchName,
    source.totalSharesAuthorized,
    source.initialIssuedShares,
    source.representativeDirector,
    source.directorTerm,
    ...purposes,
    ...shareholders.map((item) => item.name),
    ...directors.map((item) => item.name),
  ].filter(hasValue).length;

  return (
    <>
      <main className="articles-review-page">
        <div className="articles-review-container">
          <div className="articles-review-hero">
            <div>
              <p className="articles-review-eyebrow">입력 내용 확인</p>
              <h1>히어링 시트 내용을 다시 확인해 주세요</h1>
              <p className="articles-review-description">
                전송하기 전에 입력한 정보를 한 번 더 검토하세요. 수정이 필요하면
                히어링 시트로 돌아가 변경할 수 있습니다.
              </p>
            </div>
            <p className="articles-review-count">
              입력 항목 {completedCount}개
            </p>
          </div>

          <div className="articles-review-grid">
            <ReviewSection number="01" title="회사 정보">
              <dl>
                <ReviewRow label="상호" value={source.companyName} />
                <ReviewRow label="영문 상호" value={source.companyNameEn} />
                <ReviewRow
                  label="본점 소재지"
                  value={source.headOfficeAddress}
                />
              </dl>
            </ReviewSection>

            <ReviewSection number="02" title="사업 정보">
              <div className="articles-review-purpose-list">
                <p>사업 목적</p>
                {purposes.length > 0 ? (
                  <ol>
                    {purposes.map((purpose, index) => (
                      <li key={`${purpose}-${index}`}>{purpose}</li>
                    ))}
                  </ol>
                ) : (
                  <strong>미입력</strong>
                )}
              </div>
            </ReviewSection>

            <ReviewSection number="03" title="금융·자본 정보">
              <dl>
                <ReviewRow label="자본금" value={source.capital} />
                <ReviewRow
                  label="납입 은행"
                  value={source.capitalPaymentBank?.bankName}
                />
                <ReviewRow
                  label="지점명"
                  value={source.capitalPaymentBank?.branchName}
                />
                <ReviewRow
                  label="발행가능주식총수"
                  value={source.totalSharesAuthorized}
                />
                <ReviewRow
                  label="설립 시 발행주식수"
                  value={source.initialIssuedShares}
                />
              </dl>
            </ReviewSection>

            <ReviewSection number="04" title="주주 정보">
              {shareholders.length > 0 ? (
                <div className="articles-review-people-list">
                  {shareholders.map((participant, index) => (
                    <article
                      key={`${participant.name}-${index}`}
                      className="articles-review-person"
                    >
                      <h3>{participantTitle(participant, index)}</h3>
                      <dl>
                        <ReviewRow label="이름" value={participant.name} />
                        <ReviewRow label="주소" value={participant.address} />
                        <ReviewRow
                          label="출자금액"
                          value={participant.investmentAmount}
                        />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="articles-review-empty-value">
                  입력한 주주 정보가 없습니다.
                </p>
              )}
            </ReviewSection>

            <ReviewSection number="05" title="임원 정보" wide>
              <div className="articles-review-executive-summary">
                <ReviewRow
                  label="대표이사"
                  value={source.representativeDirector}
                />
                <ReviewRow label="이사 임기" value={source.directorTerm} />
              </div>
              {directors.length > 0 ? (
                <div className="articles-review-director-grid">
                  {directors.map((director, index) => (
                    <article
                      key={`${director.name}-${index}`}
                      className="articles-review-person"
                    >
                      <h3>이사 {index + 1}</h3>
                      <dl>
                        <ReviewRow label="이름" value={director.name} />
                        <ReviewRow
                          label="로마자 성명"
                          value={director.romanizedName}
                        />
                        <ReviewRow label="주소" value={director.address} />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="articles-review-empty-value">
                  입력한 이사 정보가 없습니다.
                </p>
              )}
            </ReviewSection>
          </div>

          {!submittedResult && (
            <section className="articles-required-documents">
              <div className="articles-required-documents-head">
                <div>
                  <p className="articles-review-eyebrow">필요 서류 확인</p>
                  <h2>법인 설립에 필요한 서류를 확인해 주세요</h2>
                </div>
                <strong>모든 서류는 발급일로부터 1개월 이내</strong>
              </div>
              <div className="articles-required-documents-grid">
                {REQUIRED_DOCUMENT_GROUPS.map((group, index) => (
                  <article key={group.id}>
                    <h3>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {group.title}
                    </h3>
                    <p>{group.description}</p>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.id}>{item.label}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <label className="articles-required-documents-confirm">
                <input
                  type="checkbox"
                  checked={documentsConfirmed}
                  onChange={(event) =>
                    setDocumentsConfirmed(event.target.checked)
                  }
                />
                <span>
                  필요 서류와 발급일 기준을 확인했습니다. 전송 후 마이페이지의
                  내 파일 관리에서 서류를 업로드하겠습니다.
                </span>
              </label>
              <p className="articles-required-documents-next">
                <strong>전송하기</strong>를 눌러 완료해 주세요.
                <span aria-hidden="true">↓</span>
              </p>
            </section>
          )}

          {submitError && (
            <p className="articles-review-submit-error" role="alert">
              {submitError}
            </p>
          )}

          {submittedResult ? (
            <section className="articles-review-complete" aria-live="polite">
              <div>
                <p className="articles-review-eyebrow">전송 완료</p>
                <h2>히어링 시트가 정상적으로 전송되었습니다.</h2>
                <p>
                  입력한 내용을 바탕으로 정관 초안이 생성되었습니다. 이어서
                  상담을 예약하거나 홈으로 이동할 수 있습니다.
                </p>
              </div>
              <div className="articles-review-complete-actions">
                <Link className="articles-review-secondary-link" to="/">
                  홈으로 가기
                </Link>
                <Link
                  className="articles-review-secondary-link"
                  to="/mypage/required-documents"
                >
                  내 파일 관리
                </Link>
                <Link
                  className="articles-review-primary-link"
                  to="/reservation"
                >
                  예약하기
                </Link>
              </div>
            </section>
          ) : (
            <div className="articles-review-actions" ref={submitActionsRef}>
              <Link
                className="articles-review-secondary-link"
                to="/hearing-sheet"
              >
                입력 내용 수정
              </Link>
              <button
                type="button"
                className="articles-review-primary-link articles-review-submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || !documentsConfirmed}
              >
                {isSubmitting ? "전송 중..." : "전송하기"}
              </button>
            </div>
          )}
        </div>

        {!submittedResult && showScrollGuide && (
          <button
            type="button"
            className="articles-review-floating-guide"
            aria-label="아래 내용 계속 보기"
            onClick={() =>
              window.scrollBy({
                top: Math.max(window.innerHeight * 0.7, 420),
                behavior: "smooth",
              })
            }
          >
            <span>SCROLL</span>
            <strong aria-hidden="true">↓</strong>
          </button>
        )}
      </main>
    </>
  );
}
