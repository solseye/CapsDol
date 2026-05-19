import { Link, useLocation } from "react-router-dom";
import "../App.css";

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
      <div className="App">
        <main className="hs-page">
          <div className="container hs-container">
            <h1 className="section-title">정관 확인</h1>
            <p className="section-desc">
              표시할 정관 데이터가 없습니다. 히어링 시트를 먼저 작성해 주세요.
            </p>

            <Link to="/hearing-sheet" className="btn primary">
              히어링 시트로 이동
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <main className="hs-page">
        <div className="container hs-container">
          <div className="hs-head">
            <div>
              <div className="kicker">Articles Preview</div>
              <h1 className="section-title hs-title">정관 확인</h1>
              <p className="section-desc hs-intro">
                히어링 시트 내용을 바탕으로 채워진 정관입니다. 입력 정보가
                맞는지 확인해 주세요.
              </p>
            </div>

            <Link to="/hearing-sheet" className="btn">
              히어링 시트 수정하기
            </Link>
          </div>

          <section className="hs-block articles-preview-block articles-paper">
            <div className="articles-doc-head">
              <span>Draft Articles</span>
              <strong>정관</strong>
            </div>

            {source ? (
              <div className="articles-document">
                <h2>정관 초안</h2>

                <article className="articles-clause">
                  <h3>제1조 (상호)</h3>
                  <p>
                    본 회사의 상호는 <Highlight>{displayValue(source.companyName)}</Highlight>
                    로 한다. 영문 표기는{" "}
                    <Highlight>{displayValue(source.companyNameEn)}</Highlight>로 한다.
                  </p>
                </article>

                <article className="articles-clause">
                  <h3>제2조 (목적)</h3>
                  <p>본 회사는 다음 각 호의 사업을 목적으로 한다.</p>
                  <ol>
                    {objectValues(source.Purpose).map((purpose, index) => (
                      <li key={`purpose-${index}`}>
                        <Highlight>{displayValue(purpose.content)}</Highlight>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="articles-clause">
                  <h3>제3조 (자본금)</h3>
                  <p>
                    본 회사의 자본금은 <Highlight>{displayValue(source.capital)}</Highlight>
                    로 한다.
                  </p>
                </article>

                <article className="articles-clause">
                  <h3>제4조 (자본금 납입 은행)</h3>
                  <p>
                    자본금 납입 은행은{" "}
                    <Highlight>{displayValue(source.capitalPaymentBank?.bankName)}</Highlight>{" "}
                    <Highlight>{displayValue(source.capitalPaymentBank?.branchName)}</Highlight>
                    지점으로 한다.
                  </p>
                </article>

                <article className="articles-clause">
                  <h3>제5조 (발기인 및 출자자)</h3>
                  <p>본 회사의 발기인 및 출자자는 다음과 같다.</p>
                  <ol>
                    {objectValues(source.Founder).map((founder, index) => (
                      <li key={`founder-${index}`}>
                        주소 <Highlight>{displayValue(founder.address)}</Highlight>, 성명{" "}
                        <Highlight>{displayValue(founder.name)}</Highlight>, 출자금액{" "}
                        <Highlight>{displayValue(founder.investmentAmount)}</Highlight>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="articles-clause">
                  <h3>제6조 (이사)</h3>
                  <p>본 회사의 이사는 다음과 같다.</p>
                  <ol>
                    {objectValues(source.Director).map((director, index) => (
                      <li key={`director-${index}`}>
                        주소 <Highlight>{displayValue(director.address)}</Highlight>, 성명{" "}
                        <Highlight>{displayValue(director.name)}</Highlight>, 로마자 성명{" "}
                        <Highlight>{displayValue(director.romanizedName)}</Highlight>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="articles-clause">
                  <h3>제7조 (대표이사)</h3>
                  <p>
                    본 회사의 대표이사는{" "}
                    <Highlight>{displayValue(source.representativeDirector)}</Highlight>로 한다.
                  </p>
                </article>

                <article className="articles-clause">
                  <h3>제8조 (이사의 임기)</h3>
                  <p>
                    이사의 임기는 <Highlight>{displayValue(source.directorTerm)}</Highlight>
                    로 한다.
                  </p>
                </article>
              </div>
            ) : (
              <>
                {/* 기존 단순 텍스트 미리보기 방식입니다. */}
                <pre className="articles-content">{articlesData.content}</pre>
              </>
            )}

            <p className="articles-note">
              본 문서는 히어링 시트 입력값을 바탕으로 생성된 확인용 정관
              초안입니다.
            </p>
          </section>

          <div className="hs-actions">
            {/* 기존 버튼 구성입니다. */}
            {/* <Link to="/reservation" className="btn primary">
              내용 확인 후 상담 예약
            </Link> */}
            <button type="button" className="btn" onClick={handlePdfPreview}>
              PDF 미리보기
            </button>
            <Link to="/reservation" className="btn primary">
              내용 확인 후 상담 예약
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
