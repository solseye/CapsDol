import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
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
    <section className={`articles-review-section${wide ? " articles-review-section--wide" : ""}`}>
      <div className="articles-review-section-heading">
        <span aria-hidden="true">{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DateRange({ title, value }) {
  return (
    <div className="articles-review-date-range">
      <p>{title}</p>
      <strong>
        {displayValue(value?.start)} <span aria-hidden="true">-</span> {displayValue(value?.end)}
      </strong>
    </div>
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
  const source = location.state?.articlesData?.source;
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  if (!source) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} />
        <main className="articles-review-page articles-review-empty">
          <div className="articles-review-container">
            <p className="articles-review-eyebrow">입력 내용 확인</p>
            <h1>확인할 히어링 시트가 없습니다.</h1>
            <p>히어링 시트를 작성한 뒤 입력한 내용을 다시 확인할 수 있습니다.</p>
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
    [item?.name, item?.address, item?.investmentAmount].some(hasValue)
  );
  const directors = collectionValues(source.Director).filter((item) =>
    [item?.name, item?.address, item?.romanizedName].some(hasValue)
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
    source.businessYear?.start,
    source.businessYear?.end,
    source.firstBusinessYear?.start,
    source.firstBusinessYear?.end,
    source.representativeDirector,
    source.directorTerm,
    ...purposes,
    ...shareholders.map((item) => item.name),
    ...directors.map((item) => item.name),
  ].filter(hasValue).length;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <main className="articles-review-page">
        <div className="articles-review-container">
          <header className="articles-review-hero">
            <div>
              <p className="articles-review-eyebrow">입력 내용 확인</p>
              <h1>히어링 시트 내용을 다시 확인해 주세요</h1>
              <p>
                제출한 기본 정보를 한 번 더 검토하세요. 수정이 필요하면 히어링
                시트에서 바로 변경할 수 있습니다.
              </p>
            </div>
            <p className="articles-review-count">입력 항목 {completedCount}개</p>
          </header>

          <div className="articles-review-grid">
            <ReviewSection number="01" title="회사 정보">
              <dl>
                <ReviewRow label="상호" value={source.companyName} />
                <ReviewRow label="영문 상호" value={source.companyNameEn} />
                <ReviewRow label="본점 소재지" value={source.headOfficeAddress} />
              </dl>
            </ReviewSection>

            <ReviewSection number="02" title="사업·회계 정보">
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
              <DateRange title="최초 사업연도" value={source.firstBusinessYear} />
              <DateRange title="매년 사업연도" value={source.businessYear} />
            </ReviewSection>

            <ReviewSection number="03" title="금융·자본 정보">
              <dl>
                <ReviewRow label="자본금" value={source.capital} />
                <ReviewRow label="납입 은행" value={source.capitalPaymentBank?.bankName} />
                <ReviewRow label="지점명" value={source.capitalPaymentBank?.branchName} />
                <ReviewRow label="발행가능주식총수" value={source.totalSharesAuthorized} />
                <ReviewRow label="설립 시 발행주식수" value={source.initialIssuedShares} />
              </dl>
            </ReviewSection>

            <ReviewSection number="04" title="주주 정보">
              {shareholders.length > 0 ? (
                <div className="articles-review-people-list">
                  {shareholders.map((participant, index) => (
                    <article key={`${participant.name}-${index}`} className="articles-review-person">
                      <h3>{participantTitle(participant, index)}</h3>
                      <dl>
                        <ReviewRow label="이름" value={participant.name} />
                        <ReviewRow label="주소" value={participant.address} />
                        <ReviewRow label="출자금액" value={participant.investmentAmount} />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="articles-review-empty-value">입력한 주주 정보가 없습니다.</p>
              )}
            </ReviewSection>

            <ReviewSection number="05" title="임원 정보" wide>
              <div className="articles-review-executive-summary">
                <ReviewRow label="대표이사" value={source.representativeDirector} />
                <ReviewRow label="이사 임기" value={source.directorTerm} />
              </div>
              {directors.length > 0 ? (
                <div className="articles-review-director-grid">
                  {directors.map((director, index) => (
                    <article key={`${director.name}-${index}`} className="articles-review-person">
                      <h3>이사 {index + 1}</h3>
                      <dl>
                        <ReviewRow label="이름" value={director.name} />
                        <ReviewRow label="로마자 성명" value={director.romanizedName} />
                        <ReviewRow label="주소" value={director.address} />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="articles-review-empty-value">입력한 이사 정보가 없습니다.</p>
              )}
            </ReviewSection>
          </div>

          <div className="articles-review-actions">
            <Link className="articles-review-secondary-link" to="/hearing-sheet">
              입력 내용 수정
            </Link>
            <Link className="articles-review-primary-link" to="/reservation">
              상담 예약하기
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
