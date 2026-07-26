import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createArticles } from "../api/articleApi";
import "../App.css";
import { getCurrentLanguage, translate } from "../i18n/translations";
import "../styles/hearing-sheet-visily.css";

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
  const [currentStep, setCurrentStep] = useState(0);

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
      businessYear: {
        start: businessYearStart,
        end: businessYearEnd,
      },
      initialIssuedShares,
      firstBusinessYear: {
        start: firstBusinessYearStart,
        end: firstBusinessYearEnd,
      },
      description: "히어링 시트 기반 정관",
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      // master 정관자동저장API 반영:
      // 화면 디자인은 현재 브랜치의 단계형 UI를 유지하고, 제출 데이터만 백엔드에 저장/생성 요청합니다.
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

  const steps = [
    {
      title: "회사 기본 정보",
      desc: "상호와 영문명을 입력해 정관의 첫 기준 정보를 정리합니다.",
      icon: "01",
    },
    {
      title: "사업 목적",
      desc: "정관에 반영될 사업 목적을 항목별로 작성합니다.",
      icon: "02",
    },
    {
      title: "자본금·주식·은행",
      desc: "자본금, 납입 은행, 발행 가능 주식 정보를 입력합니다.",
      icon: "03",
    },
    {
      title: "발기인·이사",
      desc: "발기인, 이사, 대표이사, 임기 정보를 정리합니다.",
      icon: "04",
    },
    {
      title: "소재지·사업연도",
      desc: "본점 소재지와 사업연도 정보를 입력하고 최종 제출합니다.",
      icon: "05",
    },
  ];

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const filledPurposes = purposes.filter((purpose) => purpose.content.trim()).length;
  const filledFounders = founders.filter(
    (founder) =>
      founder.name.trim() ||
      founder.address.trim() ||
      founder.investmentAmount.trim(),
  ).length;
  const filledDirectors = directors.filter(
    (director) =>
      director.name.trim() ||
      director.address.trim() ||
      director.romanizedName.trim(),
  ).length;

  const goPrevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const goNextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const summaryValue = (value) => value || "-";

  const renderStepFields = () => {
    if (currentStep === 0) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>회사 기본 정보</h2>
              <p>일본 법인 설립 문서에 들어갈 기본 상호 정보를 입력합니다.</p>
            </div>
            <span>Recommended</span>
          </div>

          <div className="hsv-grid2">
            <div className="hsv-field">
              <label>{t("hearing.companyName")}</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("hearing.companyNamePlaceholder")}
              />
            </div>

            <div className="hsv-field">
              <label>{t("hearing.companyNameEn")}</label>
              <input
                value={companyNameEn}
                onChange={(e) => setCompanyNameEn(e.target.value)}
                placeholder={t("hearing.companyNameEnPlaceholder")}
              />
            </div>
          </div>

          <div className="hsv-note-box">
            <strong>안내</strong>
            <p>
              상호와 영문명은 정관 초안의 첫 조항에 반영됩니다. 아직 확정되지
              않았다면 임시 명칭으로 작성해도 됩니다.
            </p>
          </div>
        </section>
      );
    }

    if (currentStep === 1) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>{t("hearing.purposeSection")}</h2>
              <p>회사가 실제로 수행할 사업 내용을 정관 목적 조항으로 정리합니다.</p>
            </div>
            <button type="button" className="hsv-small-btn" onClick={addPurpose}>
              {t("hearing.addPurpose")}
            </button>
          </div>

          <div className="hsv-stack">
            {purposes.map((purpose, index) => (
              <div className="hsv-repeat-card" key={index}>
                <div className="hsv-repeat-head">
                  <strong>{t("hearing.purposeLabel", { count: index + 1 })}</strong>
                  {purposes.length > 1 && (
                    <button type="button" onClick={() => removePurpose(index)}>
                      &minus;
                    </button>
                  )}
                </div>
                <input
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
      );
    }

    if (currentStep === 2) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>자본금·주식·납입 은행</h2>
              <p>설립 시 자본 구조와 자본금 납입 정보를 정리합니다.</p>
            </div>
          </div>

          <div className="hsv-grid2">
            <div className="hsv-field">
              <label>{t("hearing.capital")}</label>
              <input
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder={t("hearing.capitalPlaceholder")}
              />
            </div>

            <div className="hsv-field">
              <label>{t("hearing.totalSharesAuthorized")}</label>
              <input
                value={totalSharesAuthorized}
                onChange={(e) => setTotalSharesAuthorized(e.target.value)}
                placeholder={t("hearing.totalSharesAuthorizedPlaceholder")}
              />
            </div>

            <div className="hsv-field">
              <label>{t("hearing.initialIssuedShares")}</label>
              <input
                value={initialIssuedShares}
                onChange={(e) => setInitialIssuedShares(e.target.value)}
                placeholder={t("hearing.initialIssuedSharesPlaceholder")}
              />
            </div>

            <div className="hsv-field">
              <label>{t("hearing.bankName")}</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t("hearing.bankNamePlaceholder")}
              />
            </div>

            <div className="hsv-field">
              <label>{t("hearing.branchName")}</label>
              <input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder={t("hearing.branchNamePlaceholder")}
              />
            </div>
          </div>
        </section>
      );
    }

    if (currentStep === 3) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>발기인·이사 정보</h2>
              <p>설립 참여자와 임원 정보를 상담 자료 형태로 정리합니다.</p>
            </div>
          </div>

          <div className="hsv-subsection-head">
            <h3>{t("hearing.founderSection")}</h3>
            <button type="button" className="hsv-small-btn" onClick={addFounder}>
              {t("hearing.addFounder")}
            </button>
          </div>

          <div className="hsv-stack">
            {founders.map((founder, index) => (
              <div className="hsv-repeat-card" key={index}>
                <div className="hsv-repeat-head">
                  <strong>{t("hearing.founderTitle", { count: index + 1 })}</strong>
                  {founders.length > 1 && (
                    <button type="button" onClick={() => removeFounder(index)}>
                      &minus;
                    </button>
                  )}
                </div>
                <div className="hsv-grid2">
                  <input
                    value={founder.address}
                    onChange={(e) => updateFounder(index, "address", e.target.value)}
                    placeholder={t("hearing.addressPlaceholder")}
                  />
                  <input
                    value={founder.name}
                    onChange={(e) => updateFounder(index, "name", e.target.value)}
                    placeholder={t("hearing.namePlaceholder")}
                  />
                  <input
                    value={founder.investmentAmount}
                    onChange={(e) =>
                      updateFounder(index, "investmentAmount", e.target.value)
                    }
                    placeholder={t("hearing.investmentPlaceholder")}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hsv-subsection-head">
            <h3>{t("hearing.directorSection")}</h3>
            <button type="button" className="hsv-small-btn" onClick={addDirector}>
              {t("hearing.addDirector")}
            </button>
          </div>

          <div className="hsv-stack">
            {directors.map((director, index) => (
              <div className="hsv-repeat-card" key={index}>
                <div className="hsv-repeat-head">
                  <strong>{t("hearing.directorTitle", { count: index + 1 })}</strong>
                  {directors.length > 1 && (
                    <button type="button" onClick={() => removeDirector(index)}>
                      &minus;
                    </button>
                  )}
                </div>
                <div className="hsv-grid2">
                  <input
                    value={director.address}
                    onChange={(e) => updateDirector(index, "address", e.target.value)}
                    placeholder={t("hearing.addressPlaceholder")}
                  />
                  <input
                    value={director.name}
                    onChange={(e) => updateDirector(index, "name", e.target.value)}
                    placeholder={t("hearing.namePlaceholder")}
                  />
                  <input
                    value={director.romanizedName}
                    onChange={(e) =>
                      updateDirector(index, "romanizedName", e.target.value)
                    }
                    placeholder={t("hearing.romanizedNamePlaceholder")}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hsv-grid2 hsv-final-row">
            <div className="hsv-field">
              <label>{t("hearing.representativeName")}</label>
              <input
                value={representativeDirector}
                onChange={(e) => setRepresentativeDirector(e.target.value)}
                placeholder={t("hearing.representativePlaceholder")}
              />
            </div>
            <div className="hsv-field">
              <label>{t("hearing.directorTerm")}</label>
              <input
                value={directorTerm}
                onChange={(e) => setDirectorTerm(e.target.value)}
                placeholder={t("hearing.directorTermPlaceholder")}
              />
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="hsv-form-card">
        <div className="hsv-card-head">
          <div>
            <h2>소재지·사업연도</h2>
            <p>본점 주소와 사업연도 정보를 입력하고 정관 초안 생성을 완료합니다.</p>
          </div>
        </div>

        <div className="hsv-grid2">
          <div className="hsv-field hsv-wide-field">
            <label>{t("hearing.headOfficeAddress")}</label>
            <input
              value={headOfficeAddress}
              onChange={(e) => setHeadOfficeAddress(e.target.value)}
              placeholder={t("hearing.headOfficeAddressPlaceholder")}
            />
          </div>

          <div className="hsv-field">
            <label>{t("hearing.businessYearStart")}</label>
            <input
              value={businessYearStart}
              onChange={(e) => setBusinessYearStart(e.target.value)}
              placeholder={t("hearing.businessYearStartPlaceholder")}
            />
          </div>

          <div className="hsv-field">
            <label>{t("hearing.businessYearEnd")}</label>
            <input
              value={businessYearEnd}
              onChange={(e) => setBusinessYearEnd(e.target.value)}
              placeholder={t("hearing.businessYearEndPlaceholder")}
            />
          </div>

          <div className="hsv-field">
            <label>{t("hearing.firstBusinessYearStart")}</label>
            <input
              value={firstBusinessYearStart}
              onChange={(e) => setFirstBusinessYearStart(e.target.value)}
              placeholder={t("hearing.firstBusinessYearStartPlaceholder")}
            />
          </div>

          <div className="hsv-field">
            <label>{t("hearing.firstBusinessYearEnd")}</label>
            <input
              value={firstBusinessYearEnd}
              onChange={(e) => setFirstBusinessYearEnd(e.target.value)}
              placeholder={t("hearing.firstBusinessYearEndPlaceholder")}
            />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="hsv-page">
      <header className="hsv-topbar">
        <Link to="/" className="hsv-logo">
          <span>◎</span>
          <strong>WVA AI Consulting</strong>
          <small>Japan Entry OS</small>
        </Link>

        <nav className="hsv-top-nav" aria-label="주요 메뉴">
          <Link to="/">서비스</Link>
          <Link to="/chat">AI 상담</Link>
          <Link to="/reservation">전문가</Link>
          <Link to="/myreservations">내 예약</Link>
        </nav>

        <div className="hsv-top-actions">
          <div className="hsv-top-search">
            <span>⌕</span>
            <input placeholder="문서 또는 전문가 검색..." />
          </div>
          <Link to="/myreservations" className="hsv-portal-btn">
            User Portal
          </Link>
        </div>
      </header>

      <div className="hsv-shell">
        <div className="hsv-breadcrumb-wrap">
          <div className="hsv-breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <strong>Hearing Sheet</strong>
          </div>
        </div>

        <main className="hsv-main">
          <section className="hsv-content">
            <div className="hsv-hero">
              <div>
                <p className="hsv-time">예상 작성 시간: 15분</p>
                <h1>법인 설립 히어링 시트</h1>
                <p>
                  일본 법인 설립과 정관 초안 작성을 위해 필요한 정보를 단계별로
                  입력해 주세요. 입력한 내용은 정관 초안 페이지에 반영됩니다.
                </p>
              </div>
              <div className="hsv-hero-illust" aria-hidden="true">DOC</div>
            </div>

            <div className="hsv-progress-head">
              <strong>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </strong>
              <span>{progress}% 완료</span>
            </div>
            <div className="hsv-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="hsv-stepper">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  className={index === currentStep ? "active" : ""}
                  onClick={() => setCurrentStep(index)}
                  title={step.desc}
                >
                  {step.icon}
                </button>
              ))}
            </div>

            <form className="hsv-form" onSubmit={handleSubmit}>
              {/* 기존 입력/제출 기능은 유지하고, Visily 프레임처럼 단계별 화면으로만 재배치합니다. */}
              {renderStepFields()}

              {submitError && <p className="login-error">{submitError}</p>}

              <div className="hsv-actions">
                <button
                  type="button"
                  className="hsv-secondary-btn"
                  onClick={goPrevStep}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  이전
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    className="hsv-primary-btn"
                    onClick={goNextStep}
                    disabled={isSubmitting}
                  >
                    다음 단계
                  </button>
                ) : (
                  <button type="submit" className="hsv-primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? "정관 생성 중..." : "정관 초안 생성"}
                  </button>
                )}
              </div>
            </form>

            <div className="hsv-helper-grid">
              <Link to="/chat" className="hsv-helper-card">
                <strong>AI 문서 가이드</strong>
                <p>일본 법인 설립 규칙이나 작성 항목이 헷갈릴 때 질문하세요.</p>
              </Link>
              <Link to="/reservation" className="hsv-helper-card">
                <strong>전문가 상담 연결</strong>
                <p>복잡한 구조는 회계·법무 전문가와 상담으로 확인하세요.</p>
              </Link>
            </div>
          </section>

          <aside className="hsv-summary">
            <div className="hsv-summary-head">
              <h2>Hearing Summary</h2>
              <span>Draft</span>
            </div>

            <div className="hsv-summary-section">
              <h3>Basic Info</h3>
              <dl>
                <div>
                  <dt>상호</dt>
                  <dd>{summaryValue(companyName)}</dd>
                </div>
                <div>
                  <dt>영문명</dt>
                  <dd>{summaryValue(companyNameEn)}</dd>
                </div>
                <div>
                  <dt>본점 소재지</dt>
                  <dd>{summaryValue(headOfficeAddress)}</dd>
                </div>
              </dl>
            </div>

            <div className="hsv-summary-section">
              <h3>Financials</h3>
              <dl>
                <div>
                  <dt>자본금</dt>
                  <dd>{summaryValue(capital)}</dd>
                </div>
                <div>
                  <dt>납입 은행</dt>
                  <dd>{bankName || branchName ? `${bankName} ${branchName}` : "-"}</dd>
                </div>
                <div>
                  <dt>발행 가능 주식</dt>
                  <dd>{summaryValue(totalSharesAuthorized)}</dd>
                </div>
              </dl>
            </div>

            <div className="hsv-summary-section">
              <h3>Structure</h3>
              <dl>
                <div>
                  <dt>사업 목적</dt>
                  <dd>{filledPurposes}개 입력</dd>
                </div>
                <div>
                  <dt>발기인</dt>
                  <dd>{filledFounders}명 입력</dd>
                </div>
                <div>
                  <dt>이사</dt>
                  <dd>{filledDirectors}명 입력</dd>
                </div>
                <div>
                  <dt>대표이사</dt>
                  <dd>{summaryValue(representativeDirector)}</dd>
                </div>
              </dl>
            </div>

            <div className="hsv-next-actions">
              <h3>Next Actions</h3>
              <div>
                <span>정관 초안</span>
                <strong>{progress === 100 ? "생성 가능" : "입력 진행 중"}</strong>
              </div>
              <div>
                <span>전문가 상담</span>
                <strong>예약 가능</strong>
              </div>
              <div>
                <span>등기 신청</span>
                <strong>전문가 검토 필요</strong>
              </div>
            </div>

            <div className="hsv-advisory">
              <strong>AI Advisory</strong>
              <p>
                입력한 정보는 정관 초안으로 구조화됩니다. 실제 법인 설립 전에는
                전문가 검토를 권장합니다.
              </p>
              <Link to="/chat">AI에게 더 물어보기</Link>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
