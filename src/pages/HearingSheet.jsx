import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createArticles } from "../api/articleApi";
import "../App.css";

export default function HearingSheet() {
  const [companyName, setCompanyName] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [capital, setCapital] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [representativeDirector, setRepresentativeDirector] = useState("");
  const [directorTerm, setDirectorTerm] = useState("");

  const [headOfficeAddress, setHeadOfficeAddress] = useState("");
  const [totalSharesAuthorized, setTotalSharesAuthorized] = useState("");
  const [initialIssuedShares, setInitialIssuedShares] = useState("");

  const [purposes, setPurposes] = useState([{ content: "" }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [founders, setFounders] = useState([
    {
      address: "",
      name: "",
      investmentAmount: "",
    },
  ]);

  const [directors, setDirectors] = useState([
    {
      address: "",
      name: "",
      romanizedName: "",
    },
  ]);

  const addPurpose = () => {
    setPurposes([...purposes, { content: "" }]);
  };

  const addFounder = () => {
    setFounders([
      ...founders,
      {
        address: "",
        name: "",
        investmentAmount: "",
      },
    ]);
  };

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        address: "",
        name: "",
        romanizedName: "",
      },
    ]);
  };

  const updatePurpose = (index, value) => {
    const next = [...purposes];
    next[index].content = value;
    setPurposes(next);
  };

  const updateFounder = (index, field, value) => {
    const next = [...founders];
    next[index][field] = value;
    setFounders(next);
  };

  const updateDirector = (index, field, value) => {
    const next = [...directors];
    next[index][field] = value;
    setDirectors(next);
  };

  const convertArrayToObject = (array) => {
    return array.reduce((acc, item, index) => {
      acc[index + 1] = item;
      return acc;
    }, {});
  };

  const formatList = (items, formatter) => {
    return items.map((item, index) => formatter(item, index)).join("\n");
  };

  const buildArticlesContent = (data) => {
    const purposeText = formatList(
      Object.values(data.Purpose),
      (purpose, index) => `  ${index + 1}. ${purpose.content || "미입력"}`
    );

    const founderText = formatList(
      Object.values(data.Founder),
      (founder, index) =>
        `  ${index + 1}. 주소: ${founder.address || "미입력"} / 성명: ${
          founder.name || "미입력"
        } / 출자금액: ${founder.investmentAmount || "미입력"}`
    );

    const directorText = formatList(
      Object.values(data.Director),
      (director, index) =>
        `  ${index + 1}. 주소: ${director.address || "미입력"} / 성명: ${
          director.name || "미입력"
        } / 로마자 성명: ${director.romanizedName || "미입력"}`
    );

    return `정관 초안

제1조 (상호)
본 회사의 상호는 ${data.companyName || "미입력"}로 한다.
영문 표기는 ${data.companyNameEn || "미입력"}로 한다.

제2조 (목적)
본 회사는 다음 사업을 목적으로 한다.
${purposeText}

제3조 (자본금)
본 회사의 자본금은 ${data.capital || "미입력"}로 한다.

제4조 (자본금 납입 은행)
자본금 납입 은행은 ${data.capitalPaymentBank.bankName || "미입력"} ${
      data.capitalPaymentBank.branchName || "미입력"
    } 지점으로 한다.

제5조 (발기인 및 출자자)
${founderText}

제6조 (이사)
${directorText}

제7조 (대표이사)
본 회사의 대표이사는 ${data.representativeDirector || "미입력"}로 한다.

제8조 (이사의 임기)
이사의 임기는 ${data.directorTerm || "미입력"}로 한다.

※ 본 문서는 히어링 시트 입력값을 바탕으로 생성된 확인용 정관 초안입니다.`;
  };

  const buildArticlesSections = (data) => {
    const purposesList = Object.values(data.Purpose).map((purpose, index) => ({
      label: `목적 ${index + 1}`,
      value: purpose.content || "미입력",
    }));

    const foundersList = Object.values(data.Founder).map((founder, index) => ({
      label: `발기인 ${index + 1}`,
      value: `${founder.name || "미입력"} / ${founder.address || "미입력"} / ${
        founder.investmentAmount || "미입력"
      }`,
    }));

    const directorsList = Object.values(data.Director).map((director, index) => ({
      label: `이사 ${index + 1}`,
      value: `${director.name || "미입력"} (${director.romanizedName || "미입력"}) / ${
        director.address || "미입력"
      }`,
    }));

    return [
      {
        title: "제1조 (상호)",
        body: "본 회사의 상호는 다음과 같이 정한다.",
        highlights: [
          { label: "상호", value: data.companyName || "미입력" },
          { label: "영문 표기", value: data.companyNameEn || "미입력" },
        ],
      },
      {
        title: "제2조 (목적)",
        body: "본 회사는 다음 사업을 목적으로 한다.",
        highlights: purposesList,
      },
      {
        title: "제3조 (자본금)",
        body: "본 회사의 자본금은 다음과 같이 정한다.",
        highlights: [{ label: "자본금", value: data.capital || "미입력" }],
      },
      {
        title: "제4조 (자본금 납입 은행)",
        body: "자본금 납입 은행은 다음과 같이 정한다.",
        highlights: [
          { label: "은행명", value: data.capitalPaymentBank.bankName || "미입력" },
          { label: "지점명", value: data.capitalPaymentBank.branchName || "미입력" },
        ],
      },
      {
        title: "제5조 (발기인 및 출자자)",
        body: "발기인 및 출자자는 다음과 같다.",
        highlights: foundersList,
      },
      {
        title: "제6조 (이사)",
        body: "이사는 다음과 같다.",
        highlights: directorsList,
      },
      {
        title: "제7조 (대표이사)",
        body: "본 회사의 대표이사는 다음과 같이 정한다.",
        highlights: [
          { label: "대표이사", value: data.representativeDirector || "미입력" },
        ],
      },
      {
        title: "제8조 (이사의 임기)",
        body: "이사의 임기는 다음과 같이 정한다.",
        highlights: [{ label: "임기", value: data.directorTerm || "미입력" }],
      },
    ];
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      Number(initialIssuedShares) >
      Number(totalSharesAuthorized)
    ) {
      setSubmitError(
        "설립 시 발행 주식 수는 발행 가능 주식 총수보다 클 수 없습니다."
      );
      return;
    }

    const hearingSheetData = {
      companyName,
      companyNameEn,

      Purpose: convertArrayToObject(purposes),

      capital,

      capitalPaymentBank: {
        bankName,
        branchName,
      },

      Founder: convertArrayToObject(founders),

      Director: convertArrayToObject(directors),

      representativeDirector,
      directorTerm,
      headOfficeAddress,
      totalSharesAuthorized,
      initialIssuedShares,

      description: "히어링 시트 기반 정관",
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const result = await createArticles(hearingSheetData);

      const articlesData = {
        source: hearingSheetData,
        content: buildArticlesContent(hearingSheetData),
        sections: buildArticlesSections(hearingSheetData),
      };

      navigate("/articles-result", {
        state: {
          articlesData,
          createdFile: result.file,
        },
      });
    } catch (error) {
      console.error("정관 생성 실패:", error);

      setSubmitError(
        error.message ||
          "정관 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <main className="hs-page">
        <div className="container hs-container">
          <div className="hs-head">
            <div>
              <div className="kicker">Hearing Sheet</div>
              <h1 className="section-title hs-title">히어링 시트</h1>
              <p className="section-desc hs-intro">
                법인 설립에 필요한 정보를 입력해 주세요.
              </p>
            </div>

            <Link to="/" className="btn">
              메인으로 돌아가기
            </Link>
          </div>

          <form className="hs-form" onSubmit={handleSubmit}>
            <section className="hs-block">
              <h2 className="hs-block-title">1. 상호</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">상호</label>
                  <input
                    className="hs-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="회사명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">영문 표기 선택</label>
                  <input
                    className="hs-input"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    placeholder="영문 회사명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">2. 사업 목적</h2>

                <button type="button" className="btn" onClick={addPurpose}>
                  + 사업 목적 추가
                </button>
              </div>

              <div className="hs-grid">
                {purposes.map((purpose, index) => (
                  <div className="hs-field" key={index}>
                    <label className="hs-label">사업 목적 {index + 1}</label>
                    <input
                      className="hs-input"
                      value={purpose.content}
                      onChange={(e) => updatePurpose(index, e.target.value)}
                      placeholder={`${index + 1}. 사업 목적을 입력하세요`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">3. 자본금</h2>

              <div className="hs-field">
                <label className="hs-label">자본금</label>
                <input
                  className="hs-input"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="예: 5,000,000엔"
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">4. 자본금 납입 은행</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">은행명</label>
                  <input
                    className="hs-input"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="은행명을 입력하세요"
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">지점명</label>
                  <input
                    className="hs-input"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="지점명을 입력하세요"
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">5. 발기인 / 출자자</h2>

                <button type="button" className="btn" onClick={addFounder}>
                  + 발기인 추가
                </button>
              </div>

              {founders.map((founder, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-subtitle">발기인 {index + 1}</div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">주소</label>
                      <input
                        className="hs-input"
                        value={founder.address}
                        onChange={(e) =>
                          updateFounder(index, "address", e.target.value)
                        }
                        placeholder="주소를 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">성명</label>
                      <input
                        className="hs-input"
                        value={founder.name}
                        onChange={(e) =>
                          updateFounder(index, "name", e.target.value)
                        }
                        placeholder="성명을 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">출자 금액</label>
                      <input
                        className="hs-input"
                        value={founder.investmentAmount}
                        onChange={(e) =>
                          updateFounder(
                            index,
                            "investmentAmount",
                            e.target.value,
                          )
                        }
                        placeholder="예: 2,500,000엔"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <div>
                  <h2 className="hs-block-title">6. 이사</h2>
                  <p className="hs-note">
                    성명은 로마자 병기를 함께 입력해 주세요.
                  </p>
                </div>

                <button type="button" className="btn" onClick={addDirector}>
                  + 이사 추가
                </button>
              </div>

              {directors.map((director, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-subtitle">이사 {index + 1}</div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">주소</label>
                      <input
                        className="hs-input"
                        value={director.address}
                        onChange={(e) =>
                          updateDirector(index, "address", e.target.value)
                        }
                        placeholder="주소를 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">성명</label>
                      <input
                        className="hs-input"
                        value={director.name}
                        onChange={(e) =>
                          updateDirector(index, "name", e.target.value)
                        }
                        placeholder="성명을 입력하세요"
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">로마자 성명</label>
                      <input
                        className="hs-input"
                        value={director.romanizedName}
                        onChange={(e) =>
                          updateDirector(index, "romanizedName", e.target.value)
                        }
                        placeholder="예: HONG GILDONG"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">7. 대표이사</h2>

              <div className="hs-field">
                <label className="hs-label">대표이사 성명</label>
                <input
                  className="hs-input"
                  value={representativeDirector}
                  onChange={(e) => setRepresentativeDirector(e.target.value)}
                  placeholder="대표이사 성명을 입력하세요"
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">8. 이사의 임기</h2>

              <div className="hs-field">
                <label className="hs-label">이사의 임기</label>
                <input
                  className="hs-input"
                  value={directorTerm}
                  onChange={(e) => setDirectorTerm(e.target.value)}
                  placeholder="1년 이상 10년 이하에서 입력하세요"
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">9. 본점 소재지</h2>

              <div className="hs-field">
                <label className="hs-label">본점 소재지</label>
                <input
                  className="hs-input"
                  value={headOfficeAddress}
                  onChange={(e) => setHeadOfficeAddress(e.target.value)}
                  placeholder="예: 오사카시 기타구"
                  required
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">10. 발행 가능 주식 총수</h2>

              <div className="hs-field">
                <label className="hs-label">발행 가능 주식 총수</label>
                <input
                  className="hs-input"
                  type="number"
                  min="1"
                  value={totalSharesAuthorized}
                  onChange={(e) => setTotalSharesAuthorized(e.target.value)}
                  placeholder="예: 1000"
                  required
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">11. 설립 시 발행 주식 수</h2>

              <div className="hs-field">
                <label className="hs-label">설립 시 발행 주식 수</label>
                <input
                  className="hs-input"
                  type="number"
                  min="1"
                  value={initialIssuedShares}
                  onChange={(e) => setInitialIssuedShares(e.target.value)}
                  placeholder="예: 100"
                  required
                />
              </div>
            </section>

            {submitError && (
              <p className="login-error">
                {submitError}
              </p>
            )}

            <div className="hs-actions">

              <Link to="/reservation" className="btn primary nav-cta">
                상담 예약페이지로 이동
              </Link>

              <button
                type="submit"
                className="btn primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "정관 생성 중..."
                  : "제출하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
