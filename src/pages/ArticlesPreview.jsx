import { Link, useLocation } from "react-router-dom";
import "../App.css";
import "../styles/articles-result-visily.css";

export default function ArticlesPreview() {
  const location = useLocation();
  const articlesData = location.state?.articlesData;
  const source = articlesData?.source;

  const displayValue = (value) => value || "미입력";
  const objectValues = (value) => Object.values(value || {});

  const Highlight = ({ children }) => (
    <strong className="articles-user-value">{children}</strong>
  );

  // 변경 이유: 별도 PDF 라이브러리 없이도 협업자 환경에서 바로 PDF 저장/미리보기가 가능하도록
  // 브라우저의 인쇄 기능을 사용하는 정관 전용 문서를 새 창으로 생성합니다.
  const escapeHtml = (value) =>
    String(displayValue(value))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const printValue = (value) =>
    `<strong class="user-value">${escapeHtml(value)}</strong>`;

  const printList = (items, renderItem) => {
    const renderedItems = items.map(renderItem).join("");
    return renderedItems || `<li>${printValue("")}</li>`;
  };

  const buildPrintableArticlesHtml = () => {
    if (!source) {
      return `
        <!doctype html>
        <html lang="ko">
          <head>
            <meta charset="utf-8" />
            <title>정관 초안</title>
            <style>
              body { margin: 0; background: #f3f4f6; color: #111827; font-family: "Noto Sans KR", Arial, sans-serif; }
              .paper { width: min(840px, calc(100% - 48px)); margin: 32px auto; background: #fff; padding: 64px 72px; box-sizing: border-box; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12); }
              h1 { margin: 0 0 36px; text-align: center; font-size: 30px; letter-spacing: 0.08em; }
              pre { white-space: pre-wrap; word-break: keep-all; line-height: 1.9; font-size: 15px; font-family: inherit; }
              @media print { body { background: #fff; } .paper { width: auto; margin: 0; padding: 0; box-shadow: none; } }
            </style>
          </head>
          <body>
            <main class="paper">
              <h1>정관 초안</h1>
              <pre>${escapeHtml(articlesData.content)}</pre>
            </main>
          </body>
        </html>
      `;
    }

    return `
      <!doctype html>
      <html lang="ko">
        <head>
          <meta charset="utf-8" />
          <title>정관 초안</title>
          <style>
            body { margin: 0; background: #f3f4f6; color: #111827; font-family: "Noto Sans KR", Arial, sans-serif; }
            .paper { width: min(840px, calc(100% - 48px)); margin: 32px auto; background: #fff; padding: 64px 72px; box-sizing: border-box; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12); }
            h1 { margin: 0 0 40px; text-align: center; font-size: 32px; letter-spacing: 0.1em; }
            article { padding: 0 0 22px; margin: 0 0 22px; border-bottom: 1px solid #e5e7eb; }
            article:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
            h2 { margin: 0 0 10px; font-size: 20px; line-height: 1.45; }
            p, li { font-size: 16px; line-height: 2; word-break: keep-all; }
            p { margin: 0; }
            ol { margin: 0; padding-left: 28px; }
            .user-value { color: #14532d; font-weight: 900; text-decoration: underline; text-decoration-color: rgba(20, 83, 45, 0.28); text-decoration-thickness: 0.14em; text-underline-offset: 0.16em; }
            .note { margin-top: 36px; color: #475569; font-size: 13px; line-height: 1.7; }
            @page { size: A4; margin: 20mm; }
            @media print {
              body { background: #fff; }
              .paper { width: auto; margin: 0; padding: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <main class="paper">
            <h1>정관 초안</h1>

            <article>
              <h2>제1조 (상호)</h2>
              <p>본 회사의 상호는 ${printValue(source.companyName)}로 한다. 영문 표기는 ${printValue(source.companyNameEn)}로 한다.</p>
            </article>

            <article>
              <h2>제2조 (목적)</h2>
              <p>본 회사는 다음 각 호의 사업을 목적으로 한다.</p>
              <ol>
                ${printList(objectValues(source.Purpose), (purpose) => `<li>${printValue(purpose.content)}</li>`)}
              </ol>
            </article>

            <article>
              <h2>제3조 (자본금)</h2>
              <p>본 회사의 자본금은 ${printValue(source.capital)}로 한다.</p>
            </article>

            <article>
              <h2>제4조 (자본금 납입 은행)</h2>
              <p>자본금 납입 은행은 ${printValue(source.capitalPaymentBank?.bankName)} ${printValue(source.capitalPaymentBank?.branchName)} 지점으로 한다.</p>
            </article>

            <article>
              <h2>제5조 (발기인 및 출자자)</h2>
              <p>본 회사의 발기인 및 출자자는 다음과 같다.</p>
              <ol>
                ${printList(
                  objectValues(source.Founder),
                  (founder) =>
                    `<li>주소 ${printValue(founder.address)}, 성명 ${printValue(founder.name)}, 출자금액 ${printValue(founder.investmentAmount)}</li>`
                )}
              </ol>
            </article>

            <article>
              <h2>제6조 (이사)</h2>
              <p>본 회사의 이사는 다음과 같다.</p>
              <ol>
                ${printList(
                  objectValues(source.Director),
                  (director) =>
                    `<li>주소 ${printValue(director.address)}, 성명 ${printValue(director.name)}, 로마자 성명 ${printValue(director.romanizedName)}</li>`
                )}
              </ol>
            </article>

            <article>
              <h2>제7조 (대표이사)</h2>
              <p>본 회사의 대표이사는 ${printValue(source.representativeDirector)}로 한다.</p>
            </article>

            <article>
              <h2>제8조 (이사의 임기)</h2>
              <p>이사의 임기는 ${printValue(source.directorTerm)}로 한다.</p>
            </article>

            <article>
              <h2>제9조 (본점 소재지)</h2>
              <p>본 회사의 본점은 ${printValue(source.headOfficeAddress)}에 둔다.</p>
            </article>

            <article>
              <h2>제10조 (발행 가능 주식 총수)</h2>
              <p>본 회사가 발행할 수 있는 주식의 총수는 ${printValue(source.totalSharesAuthorized)}로 한다.</p>
            </article>

            <article>
              <h2>제11조 (사업 연도)</h2>
              <p>본 회사의 사업 연도는 매년 ${printValue(source.businessYear?.start)}부터 ${printValue(source.businessYear?.end)}까지로 한다.</p>
            </article>

            <article>
              <h2>제12조 (설립 시 발행 주식 수)</h2>
              <p>본 회사의 설립 시 발행하는 주식의 총수는 ${printValue(source.initialIssuedShares)}로 한다.</p>
            </article>

            <article>
              <h2>제13조 (최초 사업 연도)</h2>
              <p>본 회사의 최초 사업 연도는 ${printValue(source.firstBusinessYear?.start)}부터 ${printValue(source.firstBusinessYear?.end)}까지로 한다.</p>
            </article>

            <p class="note">본 문서는 히어링 시트 입력값을 바탕으로 생성된 확인용 정관 초안입니다.</p>
          </main>
        </body>
      </html>
    `;
  };

  const handlePdfPreview = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("PDF 미리보기 창이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해 주세요.");
      return;
    }

    printWindow.opener = null;
    printWindow.document.write(buildPrintableArticlesHtml());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  if (!articlesData) {
    return (
      <div className="arv-empty-page">
        <div className="arv-empty-card">
          <span>Draft Articles</span>
          <h1>표시할 정관 데이터가 없습니다</h1>
          <p>히어링 시트를 먼저 작성하면 입력값이 반영된 정관 초안을 확인할 수 있습니다.</p>
          <Link to="/hearing-sheet">히어링 시트 작성하기</Link>
        </div>
      </div>
    );
  }

  const summaryGroups = source
    ? [
        {
          title: "기본 정보",
          items: [
            ["상호", source.companyName],
            ["영문명", source.companyNameEn],
            ["본점 소재지", source.headOfficeAddress],
          ],
        },
        {
          title: "자본·주식",
          items: [
            ["자본금", source.capital],
            [
              "납입 은행",
              source.capitalPaymentBank?.bankName || source.capitalPaymentBank?.branchName
                ? `${source.capitalPaymentBank?.bankName || ""} ${
                    source.capitalPaymentBank?.branchName || ""
                  }`
                : "",
            ],
            ["발행 가능 주식", source.totalSharesAuthorized],
            ["설립 시 발행 주식", source.initialIssuedShares],
          ],
        },
        {
          title: "임원·연도",
          items: [
            ["대표이사", source.representativeDirector],
            ["이사 임기", source.directorTerm],
            [
              "사업 연도",
              source.businessYear?.start || source.businessYear?.end
                ? `${source.businessYear?.start || "-"} ~ ${source.businessYear?.end || "-"}`
                : "",
            ],
            [
              "최초 사업 연도",
              source.firstBusinessYear?.start || source.firstBusinessYear?.end
                ? `${source.firstBusinessYear?.start || "-"} ~ ${
                    source.firstBusinessYear?.end || "-"
                  }`
                : "",
            ],
          ],
        },
      ]
    : [];

  const sectionCount = articlesData.sections?.length || 0;
  const purposeCount = objectValues(source?.Purpose).filter((item) => item.content).length;
  const founderCount = objectValues(source?.Founder).length;
  const directorCount = objectValues(source?.Director).length;

  return (
    <div className="arv-page">
      <aside className="arv-sidebar">
        <Link to="/" className="arv-logo">
          <span>◎</span>
          <strong>WVA AI Consulting</strong>
          <small>Japan Entry OS</small>
        </Link>

        <nav className="arv-side-nav">
          <Link to="/">Home</Link>
          <Link to="/hearing-sheet">Hearing Sheet</Link>
          <Link to="/articles-result" className="active">
            Articles
          </Link>
          <Link to="/reservation">Consultations</Link>
          <Link to="/myreservations">My Reservations</Link>
          <Link to="/chat">AI Chatbot</Link>
        </nav>
      </aside>

      <div className="arv-shell">
        <header className="arv-topbar">
          <div className="arv-breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <Link to="/hearing-sheet">Hearing Sheet</Link>
            <span>›</span>
            <strong>Articles Draft</strong>
          </div>

          <div className="arv-top-actions">
            <button type="button" onClick={handlePdfPreview}>
              PDF 미리보기
            </button>
            <Link to="/hearing-sheet">수정하기</Link>
          </div>
        </header>

        <main className="arv-main">
          <aside className="arv-summary-panel">
            <div className="arv-summary-head">
              <span>Draft Summary</span>
              <h1>정관 입력 요약</h1>
              <p>히어링 시트에서 입력한 정보가 정관 초안에 반영되었습니다.</p>
            </div>

            {summaryGroups.map((group) => (
              <section className="arv-summary-group" key={group.title}>
                <h2>{group.title}</h2>
                <dl>
                  {group.items.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{displayValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <section className="arv-status-card">
              <h2>문서 상태</h2>
              <div>
                <span>조항 수</span>
                <strong>{sectionCount || 13}개</strong>
              </div>
              <div>
                <span>사업 목적</span>
                <strong>{purposeCount}개</strong>
              </div>
              <div>
                <span>발기인 / 이사</span>
                <strong>
                  {founderCount}명 / {directorCount}명
                </strong>
              </div>
            </section>

            <section className="arv-advisory">
              <strong>AI Advisory</strong>
              <p>
                이 문서는 입력값을 바탕으로 만든 확인용 초안입니다. 실제 제출 전에는
                전문가 검토를 권장합니다.
              </p>
              <Link to="/reservation">전문가 상담 예약</Link>
            </section>
          </aside>

          <section className="arv-document-panel">
            <div className="arv-document-toolbar">
              <div>
                <span>Articles Preview</span>
                <h1>정관 초안 검토</h1>
              </div>
              <div className="arv-document-actions">
                <button type="button" onClick={handlePdfPreview}>
                  PDF / 인쇄
                </button>
                <Link to="/reservation">상담 예약</Link>
              </div>
            </div>

            <article className="arv-paper">
              <div className="arv-paper-head">
                <span>Draft Articles of Incorporation</span>
                <h2>정관 초안</h2>
                <p>사용자가 입력한 값은 굵은 글씨로 강조됩니다.</p>
              </div>

              {source && articlesData.sections ? (
                <div className="arv-clause-list">
                  {articlesData.sections.map((section) => (
                    <section className="arv-clause" key={section.title}>
                      <h3>{section.title}</h3>
                      <p>{section.body}</p>
                      <div className="arv-highlight-grid">
                        {section.highlights.map((highlight) => (
                          <div className="arv-highlight-item" key={highlight.label}>
                            <span>{highlight.label}</span>
                            <Highlight>{displayValue(highlight.value)}</Highlight>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <pre className="arv-content-fallback">{articlesData.content}</pre>
              )}

              <p className="arv-paper-note">
                본 문서는 히어링 시트 입력값을 바탕으로 생성된 확인용 정관 초안입니다.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
