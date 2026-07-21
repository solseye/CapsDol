import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { getCurrentLanguage, translate } from "../i18n/translations";

export default function HearingSheet() {
  const language = getCurrentLanguage();
  const t = (key, variables) => translate(language, key, variables);

  const [companyName, setCompanyName] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [headOfficeAddress, setHeadOfficeAddress] = useState("");
  const [capital, setCapital] = useState("");
  const [totalSharesAuthorized, setTotalSharesAuthorized] = useState("");
  const [initialIssuedShares, setInitialIssuedShares] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [businessYearStart, setBusinessYearStart] = useState("");
  const [businessYearEnd, setBusinessYearEnd] = useState("");
  const [firstBusinessYearStart, setFirstBusinessYearStart] = useState("");
  const [firstBusinessYearEnd, setFirstBusinessYearEnd] = useState("");
  const [representativeDirector, setRepresentativeDirector] = useState("");
  const [directorTerm, setDirectorTerm] = useState("");

  const [purposes, setPurposes] = useState([{ content: "" }]);

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

  // 추가한 사업 목적을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removePurpose = (indexToRemove) => {
    setPurposes((currentPurposes) =>
      currentPurposes.filter((_, index) => index !== indexToRemove)
    );
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

  // 추가한 발기인 입력 묶음을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removeFounder = (indexToRemove) => {
    setFounders((currentFounders) =>
      currentFounders.filter((_, index) => index !== indexToRemove)
    );
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

  // 추가한 이사 입력 묶음을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removeDirector = (indexToRemove) => {
    setDirectors((currentDirectors) =>
      currentDirectors.filter((_, index) => index !== indexToRemove)
    );
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

제9조 (본점 소재지)
본 회사의 본점은 ${data.headOfficeAddress || "미입력"}에 둔다.

제10조 (발행 가능 주식 총수)
본 회사가 발행할 수 있는 주식의 총수는 ${
      data.totalSharesAuthorized || "미입력"
    }로 한다.

제11조 (사업 연도)
본 회사의 사업 연도는 매년 ${
      data.businessYear.start || "미입력"
    }부터 ${data.businessYear.end || "미입력"}까지로 한다.

제12조 (설립 시 발행 주식 수)
본 회사의 설립 시 발행하는 주식의 총수는 ${
      data.initialIssuedShares || "미입력"
    }로 한다.

제13조 (최초 사업 연도)
본 회사의 최초 사업 연도는 ${
      data.firstBusinessYear.start || "미입력"
    }부터 ${data.firstBusinessYear.end || "미입력"}까지로 한다.

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
      {
        title: "제9조 (본점 소재지)",
        body: "본 회사의 본점은 다음과 같이 정한다.",
        highlights: [
          { label: "본점 소재지", value: data.headOfficeAddress || "미입력" },
        ],
      },
      {
        title: "제10조 (발행 가능 주식 총수)",
        body: "본 회사가 발행할 수 있는 주식의 총수는 다음과 같이 정한다.",
        highlights: [
          {
            label: "주식 발행 총 수",
            value: data.totalSharesAuthorized || "미입력",
          },
        ],
      },
      {
        title: "제11조 (사업 연도)",
        body: "본 회사의 사업 연도는 다음과 같이 정한다.",
        highlights: [
          { label: "시작일", value: data.businessYear.start || "미입력" },
          { label: "종료일", value: data.businessYear.end || "미입력" },
        ],
      },
      {
        title: "제12조 (설립 시 발행 주식 수)",
        body: "본 회사의 설립 시 발행하는 주식의 총수는 다음과 같이 정한다.",
        highlights: [
          {
            label: "초기 발행 주식 총 수",
            value: data.initialIssuedShares || "미입력",
          },
        ],
      },
      {
        title: "제13조 (최초 사업 연도)",
        body: "본 회사의 최초 사업 연도는 다음과 같이 정한다.",
        highlights: [
          { label: "시작일", value: data.firstBusinessYear.start || "미입력" },
          { label: "종료일", value: data.firstBusinessYear.end || "미입력" },
        ],
      },
    ];
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

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
      businessYear: {
        start: businessYearStart,
        end: businessYearEnd,
      },
      initialIssuedShares,
      firstBusinessYear: {
        start: firstBusinessYearStart,
        end: firstBusinessYearEnd,
      },
    };

    // 기존 동작입니다.
    // console.log("Backend로 보낼 JSON:", hearingSheetData);

    // 변경 이유: 히어링 시트 제출 후 정관 확인 페이지에서 입력값 기반 초안을 확인할 수 있도록
    // ArticlesPreview 페이지로 정관 텍스트를 전달합니다.
    console.log("Backend로 보낼 JSON:", hearingSheetData);

    const articlesData = {
      source: hearingSheetData,
      content: buildArticlesContent(hearingSheetData),
      sections: buildArticlesSections(hearingSheetData),
    };

    navigate("/articles-result", {
      state: { articlesData },
    });

    /*
      axios 또는 fetch 예시

      fetch("http://localhost:8080/api/hearing-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hearingSheetData),
      });
    */
  };

  return (
    <div className="App">
      <main className="hs-page">
        <div className="container hs-container">
          <div className="hs-head">
            <div>
              <div className="kicker">Hearing Sheet</div>
              <h1 className="section-title hs-title">{t("hearing.title")}</h1>
              <p className="section-desc hs-intro">
                {t("hearing.intro")}
              </p>
            </div>

            <Link to="/" className="btn">
              {t("common.backHome")}
            </Link>
          </div>

          <form className="hs-form" onSubmit={handleSubmit}>
            <section className="hs-block">
              <h2 className="hs-block-title">{t("hearing.companySection")}</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">{t("hearing.companyName")}</label>
                  <input
                    className="hs-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t("hearing.companyNamePlaceholder")}
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">{t("hearing.companyNameEn")}</label>
                  <input
                    className="hs-input"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    placeholder={t("hearing.companyNameEnPlaceholder")}
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">{t("hearing.purposeSection")}</h2>

                <button type="button" className="btn" onClick={addPurpose}>
                  {t("hearing.addPurpose")}
                </button>
              </div>

              <div className="hs-grid">
                {purposes.map((purpose, index) => (
                  <div className="hs-field" key={index}>
                    <div className="hs-removable-row">
                      <label className="hs-label">
                        {t("hearing.purposeLabel", { count: index + 1 })}
                      </label>
                      {purposes.length > 1 && (
                        <button
                          type="button"
                          className="hs-remove-button"
                          onClick={() => removePurpose(index)}
                          aria-label={t("hearing.removePurpose", {
                            count: index + 1,
                          })}
                          title={t("hearing.removePurpose", {
                            count: index + 1,
                          })}
                        >
                          &minus;
                        </button>
                      )}
                    </div>
                    <input
                      className="hs-input"
                      value={purpose.content}
                      onChange={(e) => updatePurpose(index, e.target.value)}
                      placeholder={t("hearing.purposePlaceholder", {
                        count: index + 1,
                      })}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">{t("hearing.capitalSection")}</h2>

              <div className="hs-field">
                <label className="hs-label">{t("hearing.capital")}</label>
                <input
                  className="hs-input"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder={t("hearing.capitalPlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">{t("hearing.bankSection")}</h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">{t("hearing.bankName")}</label>
                  <input
                    className="hs-input"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={t("hearing.bankNamePlaceholder")}
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">{t("hearing.branchName")}</label>
                  <input
                    className="hs-input"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder={t("hearing.branchNamePlaceholder")}
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <h2 className="hs-block-title">{t("hearing.founderSection")}</h2>

                <button type="button" className="btn" onClick={addFounder}>
                  {t("hearing.addFounder")}
                </button>
              </div>

              {founders.map((founder, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-removable-row hs-subtitle-row">
                    <div className="hs-subtitle">
                      {t("hearing.founderTitle", { count: index + 1 })}
                    </div>
                    {founders.length > 1 && (
                      <button
                        type="button"
                        className="hs-remove-button"
                        onClick={() => removeFounder(index)}
                        aria-label={t("hearing.removeFounder", {
                          count: index + 1,
                        })}
                        title={t("hearing.removeFounder", {
                          count: index + 1,
                        })}
                      >
                        &minus;
                      </button>
                    )}
                  </div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">{t("hearing.address")}</label>
                      <input
                        className="hs-input"
                        value={founder.address}
                        onChange={(e) =>
                          updateFounder(index, "address", e.target.value)
                        }
                        placeholder={t("hearing.addressPlaceholder")}
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">{t("hearing.name")}</label>
                      <input
                        className="hs-input"
                        value={founder.name}
                        onChange={(e) =>
                          updateFounder(index, "name", e.target.value)
                        }
                        placeholder={t("hearing.namePlaceholder")}
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">
                        {t("hearing.investmentAmount")}
                      </label>
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
                        placeholder={t("hearing.investmentPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <div className="hs-section-head">
                <div>
                  <h2 className="hs-block-title">
                    {t("hearing.directorSection")}
                  </h2>
                  <p className="hs-note">
                    {t("hearing.directorNote")}
                  </p>
                </div>

                <button type="button" className="btn" onClick={addDirector}>
                  {t("hearing.addDirector")}
                </button>
              </div>

              {directors.map((director, index) => (
                <div className="hs-subcard" key={index}>
                  <div className="hs-removable-row hs-subtitle-row">
                    <div className="hs-subtitle">
                      {t("hearing.directorTitle", { count: index + 1 })}
                    </div>
                    {directors.length > 1 && (
                      <button
                        type="button"
                        className="hs-remove-button"
                        onClick={() => removeDirector(index)}
                        aria-label={t("hearing.removeDirector", {
                          count: index + 1,
                        })}
                        title={t("hearing.removeDirector", {
                          count: index + 1,
                        })}
                      >
                        &minus;
                      </button>
                    )}
                  </div>

                  <div className="hs-grid2">
                    <div className="hs-field">
                      <label className="hs-label">{t("hearing.address")}</label>
                      <input
                        className="hs-input"
                        value={director.address}
                        onChange={(e) =>
                          updateDirector(index, "address", e.target.value)
                        }
                        placeholder={t("hearing.addressPlaceholder")}
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">{t("hearing.name")}</label>
                      <input
                        className="hs-input"
                        value={director.name}
                        onChange={(e) =>
                          updateDirector(index, "name", e.target.value)
                        }
                        placeholder={t("hearing.namePlaceholder")}
                      />
                    </div>

                    <div className="hs-field">
                      <label className="hs-label">
                        {t("hearing.romanizedName")}
                      </label>
                      <input
                        className="hs-input"
                        value={director.romanizedName}
                        onChange={(e) =>
                          updateDirector(index, "romanizedName", e.target.value)
                        }
                        placeholder={t("hearing.romanizedNamePlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.representativeSection")}
              </h2>

              <div className="hs-field">
                <label className="hs-label">
                  {t("hearing.representativeName")}
                </label>
                <input
                  className="hs-input"
                  value={representativeDirector}
                  onChange={(e) => setRepresentativeDirector(e.target.value)}
                  placeholder={t("hearing.representativePlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.directorTermSection")}
              </h2>

              <div className="hs-field">
                <label className="hs-label">{t("hearing.directorTerm")}</label>
                <input
                  className="hs-input"
                  value={directorTerm}
                  onChange={(e) => setDirectorTerm(e.target.value)}
                  placeholder={t("hearing.directorTermPlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.headOfficeSection")}
              </h2>

              <div className="hs-field">
                <label className="hs-label">{t("hearing.headOfficeAddress")}</label>
                <input
                  className="hs-input"
                  value={headOfficeAddress}
                  onChange={(e) => setHeadOfficeAddress(e.target.value)}
                  placeholder={t("hearing.headOfficeAddressPlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.totalSharesSection")}
              </h2>

              <div className="hs-field">
                <label className="hs-label">
                  {t("hearing.totalSharesAuthorized")}
                </label>
                <input
                  className="hs-input"
                  value={totalSharesAuthorized}
                  onChange={(e) => setTotalSharesAuthorized(e.target.value)}
                  placeholder={t("hearing.totalSharesAuthorizedPlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.businessYearSection")}
              </h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">
                    {t("hearing.businessYearStart")}
                  </label>
                  <input
                    className="hs-input"
                    value={businessYearStart}
                    onChange={(e) => setBusinessYearStart(e.target.value)}
                    placeholder={t("hearing.businessYearStartPlaceholder")}
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">{t("hearing.businessYearEnd")}</label>
                  <input
                    className="hs-input"
                    value={businessYearEnd}
                    onChange={(e) => setBusinessYearEnd(e.target.value)}
                    placeholder={t("hearing.businessYearEndPlaceholder")}
                  />
                </div>
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.initialIssuedSharesSection")}
              </h2>

              <div className="hs-field">
                <label className="hs-label">
                  {t("hearing.initialIssuedShares")}
                </label>
                <input
                  className="hs-input"
                  value={initialIssuedShares}
                  onChange={(e) => setInitialIssuedShares(e.target.value)}
                  placeholder={t("hearing.initialIssuedSharesPlaceholder")}
                />
              </div>
            </section>

            <section className="hs-block">
              <h2 className="hs-block-title">
                {t("hearing.firstBusinessYearSection")}
              </h2>

              <div className="hs-grid2">
                <div className="hs-field">
                  <label className="hs-label">
                    {t("hearing.firstBusinessYearStart")}
                  </label>
                  <input
                    className="hs-input"
                    value={firstBusinessYearStart}
                    onChange={(e) => setFirstBusinessYearStart(e.target.value)}
                    placeholder={t("hearing.firstBusinessYearStartPlaceholder")}
                  />
                </div>

                <div className="hs-field">
                  <label className="hs-label">
                    {t("hearing.firstBusinessYearEnd")}
                  </label>
                  <input
                    className="hs-input"
                    value={firstBusinessYearEnd}
                    onChange={(e) => setFirstBusinessYearEnd(e.target.value)}
                    placeholder={t("hearing.firstBusinessYearEndPlaceholder")}
                  />
                </div>
              </div>
            </section>

            <div className="hs-actions">
              <button type="button" className="btn">
                {t("common.temporarySave")}
              </button>

              <Link to="/reservation" className="btn primary nav-cta">
                {t("hearing.moveReservation")}
              </Link>

              <button type="submit" className="btn primary">
                {t("common.submit")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
