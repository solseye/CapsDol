import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "../components/Header";
import { getCurrentLanguage, translate } from "../i18n/translations";
import { getHearingUiCopy } from "../i18n/hearingUi";
import {
  collectionToArray,
  loadHearingSheetDraft,
  saveHearingSheetDraft,
} from "../utils/hearingSheetDraft";
import "../styles/hearing-sheet-visily.css";

const convertArrayToObject = (array) =>
  array.reduce((acc, item, index) => {
    acc[index + 1] = item;
    return acc;
  }, {});

export default function HearingSheet() {
  const language = getCurrentLanguage();
  const t = (key, variables) => translate(language, key, variables);
  const ui = getHearingUiCopy();
  const [storedDraft] = useState(loadHearingSheetDraft);
  const initialSource = storedDraft?.source || {};

  const [companyName, setCompanyName] = useState(
    initialSource.companyName || "",
  );
  const [companyNameEn, setCompanyNameEn] = useState(
    initialSource.companyNameEn || "",
  );
  const [headOfficeAddress, setHeadOfficeAddress] = useState(
    initialSource.headOfficeAddress || "",
  );
  const [capital, setCapital] = useState(initialSource.capital || "");
  const [totalSharesAuthorized, setTotalSharesAuthorized] = useState(
    initialSource.totalSharesAuthorized || "",
  );
  const [initialIssuedShares, setInitialIssuedShares] = useState(
    initialSource.initialIssuedShares || "",
  );
  const [bankName, setBankName] = useState(
    initialSource.capitalPaymentBank?.bankName || "",
  );
  const [branchName, setBranchName] = useState(
    initialSource.capitalPaymentBank?.branchName || "",
  );
  const [businessYearStart, setBusinessYearStart] = useState(
    initialSource.businessYear?.start || "",
  );
  const [businessYearEnd, setBusinessYearEnd] = useState(
    initialSource.businessYear?.end || "",
  );
  const [firstBusinessYearStart, setFirstBusinessYearStart] = useState(
    initialSource.firstBusinessYear?.start || "",
  );
  const [firstBusinessYearEnd, setFirstBusinessYearEnd] = useState(
    initialSource.firstBusinessYear?.end || "",
  );
  const [representativeDirector, setRepresentativeDirector] = useState(
    initialSource.representativeDirector || "",
  );
  const [directorTerm, setDirectorTerm] = useState(
    initialSource.directorTerm || "",
  );
  const [currentStep, setCurrentStep] = useState(storedDraft?.currentStep || 0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [validationIssues, setValidationIssues] = useState([]);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const [purposes, setPurposes] = useState(() =>
    collectionToArray(initialSource.Purpose, [{ content: "" }]),
  );

  const [submitError, setSubmitError] = useState("");
  // 👇 이 스위치(상태 변수)를 새로 추가합니다.
  const [isValidationActive, setIsValidationActive] = useState(false);

  const [founders, setFounders] = useState(() =>
    collectionToArray(initialSource.Founder, [
      {
        address: "",
        name: "",
        investmentAmount: "",
        isFounder: false,
        isInvestor: false,
      },
    ]),
  );

  const [directors, setDirectors] = useState(() =>
    collectionToArray(initialSource.Director, [
      {
        address: "",
        name: "",
        romanizedName: "",
      },
    ]),
  );

  const addPurpose = () => {
    const nextIndex = purposes.length;
    setPurposes((current) => [...current, { content: "" }]);
    focusField(`purposes.${nextIndex}.content`);
  };

  // 추가한 사업 목적을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removePurpose = (indexToRemove) => {
    setPurposes((currentPurposes) =>
      currentPurposes.filter((_, index) => index !== indexToRemove),
    );
  };

  const addFounder = () => {
    const nextIndex = founders.length;
    setFounders((current) => [
      ...current,
      {
        address: "",
        name: "",
        investmentAmount: "",
        isFounder: false,
        isInvestor: false,
      },
    ]);
    focusField(`founders.${nextIndex}.name`);
  };

  // 추가한 발기인 입력 묶음을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removeFounder = (indexToRemove) => {
    setFounders((currentFounders) =>
      currentFounders.filter((_, index) => index !== indexToRemove),
    );
  };

  const addDirector = () => {
    const nextIndex = directors.length;
    setDirectors((current) => [
      ...current,
      {
        address: "",
        name: "",
        romanizedName: "",
      },
    ]);
    focusField(`directors.${nextIndex}.name`);
    setIsValidationActive(true);
  };

  // 추가한 이사 입력 묶음을 제출 전에 개별적으로 제거할 수 있도록 한다.
  const removeDirector = (indexToRemove) => {
    setDirectors((currentDirectors) =>
      currentDirectors.filter((_, index) => index !== indexToRemove),
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

    const roleKey = `founders.${index}.role`;
    if (
      (field === "isFounder" || field === "isInvestor") &&
      fieldErrors[roleKey]
    ) {
      setFieldErrors((current) => {
        const updated = { ...current };
        delete updated[roleKey];
        return updated;
      });
    }
  };

  const updateDirector = (index, field, value) => {
    const next = [...directors];
    next[index][field] = value;
    setDirectors(next);
  };

  const hearingSheetData = useMemo(
    () => ({
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
    }),
    [
      bankName,
      branchName,
      businessYearEnd,
      businessYearStart,
      capital,
      companyName,
      companyNameEn,
      directorTerm,
      directors,
      firstBusinessYearEnd,
      firstBusinessYearStart,
      founders,
      headOfficeAddress,
      initialIssuedShares,
      purposes,
      representativeDirector,
      totalSharesAuthorized,
    ],
  );

  const formatList = (items, formatter) => {
    return items.map((item, index) => formatter(item, index)).join("\n");
  };

  const buildArticlesContent = (data) => {
    const purposeText = formatList(
      Object.values(data.Purpose),
      (purpose, index) => `  ${index + 1}. ${purpose.content || "미입력"}`,
    );

    const founderText = formatList(
      Object.values(data.Founder),
      (founder, index) =>
        `  ${index + 1}. 주소: ${founder.address || "미입력"} / 성명: ${
          founder.name || "미입력"
        } / 출자금액: ${founder.investmentAmount || "미입력"}`,
    );

    const directorText = formatList(
      Object.values(data.Director),
      (director, index) =>
        `  ${index + 1}. 주소: ${director.address || "미입력"} / 성명: ${
          director.name || "미입력"
        } / 로마자 성명: ${director.romanizedName || "미입력"}`,
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

    const directorsList = Object.values(data.Director).map(
      (director, index) => ({
        label: `이사 ${index + 1}`,
        value: `${director.name || "미입력"} (${director.romanizedName || "미입력"}) / ${
          director.address || "미입력"
        }`,
      }),
    );

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
          {
            label: "은행명",
            value: data.capitalPaymentBank.bankName || "미입력",
          },
          {
            label: "지점명",
            value: data.capitalPaymentBank.branchName || "미입력",
          },
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
  const brandName = t("common.brandName");

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${ui.pageTitle} | ${brandName}`;
  }, [brandName, language, ui.pageTitle]);

  useEffect(() => {
    // 대표이사 선택값은 기존 제출 payload의 representativeDirector 필드를 유지한다.
    setRepresentativeDirector(directors[0]?.name || "");
  }, [directors]);

  useEffect(() => {
    saveHearingSheetDraft(hearingSheetData, currentStep);
  }, [currentStep, hearingSheetData]);

  const toFieldId = (key) => `hsv-${key.replace(/[^a-zA-Z0-9]+/g, "-")}`;
  const requiredNotice = (
    <p className="hsv-required-legend">
      <span aria-hidden="true">*</span> 필수
    </p>
  );

  const focusField = (fieldKey) => {
    window.setTimeout(() => {
      document.getElementById(toFieldId(fieldKey))?.focus();
    }, 60);
  };

  const focusDateField = (fieldKey) => {
    window.setTimeout(() => {
      const nextField = document.getElementById(toFieldId(fieldKey));
      nextField?.focus();
      try {
        nextField?.showPicker?.();
      } catch {
        // 일부 브라우저는 사용자 입력 직후가 아니면 date picker 자동 열기를 막습니다.
      }
    }, 60);
  };

  const updateBusinessYearStart = (value) => {
    setBusinessYearStart(value);
    focusDateField("businessYearEnd");
  };

  const updateFirstBusinessYearStart = (value) => {
    setFirstBusinessYearStart(value);
    focusDateField("firstBusinessYearEnd");
  };

  const getDescribedBy = (fieldKey, helperId) => {
    const errorId = fieldErrors[fieldKey] ? `${toFieldId(fieldKey)}-error` : "";
    return [helperId, errorId].filter(Boolean).join(" ") || undefined;
  };

  const renderFieldError = (fieldKey) =>
    fieldErrors[fieldKey] ? (
      <p className="hsv-error-text" id={`${toFieldId(fieldKey)}-error`}>
        {fieldErrors[fieldKey]}
      </p>
    ) : null;

  const getMissingRequiredFields = () => {
    const missing = [];
    const addMissing = (condition, label, step, key) => {
      if (condition) {
        missing.push({ label, step, key });
      }
    };

    addMissing(!companyName.trim(), "상호", 0, "companyName");
    addMissing(!companyNameEn.trim(), "영문 상호", 0, "companyNameEn");
    addMissing(
      !headOfficeAddress.trim(),
      "본점 소재지",
      0,
      "headOfficeAddress",
    );

    purposes.forEach((purpose, index) => {
      addMissing(
        !purpose.content.trim(),
        `사업 목적 ${index + 1}`,
        1,
        `purposes.${index}.content`,
      );
    });

    addMissing(!bankName.trim(), "은행명", 2, "bankName");
    addMissing(!branchName.trim(), "지점명", 2, "branchName");
    addMissing(!capital.trim(), "자본금", 2, "capital");
    addMissing(
      !totalSharesAuthorized.trim(),
      "발행가능주식총수",
      2,
      "totalSharesAuthorized",
    );
    addMissing(
      !initialIssuedShares.trim(),
      "설립 시 발행주식수",
      2,
      "initialIssuedShares",
    );

    founders.forEach((founder, index) => {
      const founderTitle = getFounderCardTitle(founder, index).title;
      addMissing(
        !founder.address.trim(),
        `${founderTitle} 주소`,
        3,
        `founders.${index}.address`,
      );
      addMissing(
        !founder.name.trim(),
        `${founderTitle} 이름`,
        3,
        `founders.${index}.name`,
      );
      addMissing(
        !founder.investmentAmount.trim(),
        `${founderTitle} 출자금액`,
        3,
        `founders.${index}.investmentAmount`,
      );
      addMissing(
        !founder.isFounder && !founder.isInvestor,
        `${founderTitle} 역할`,
        3,
        `founders.${index}.role`,
      );
    });

    directors.forEach((director, index) => {
      const title = index === 0 ? "대표이사" : `이사 ${index + 1}`;
      addMissing(
        !director.address.trim(),
        `${title} 주소`,
        4,
        `directors.${index}.address`,
      );
      addMissing(
        !director.name.trim(),
        `${title} 이름`,
        4,
        `directors.${index}.name`,
      );
      addMissing(
        !director.romanizedName.trim(),
        `${title} 로마자 성명`,
        4,
        `directors.${index}.romanizedName`,
      );
    });

    addMissing(!directorTerm.trim(), "이사 임기", 4, "directorTerm");

    return missing;
  };

  const getValidationErrors = (step = null) => {
    const errors = {};
    const missingFields = getMissingRequiredFields().filter(
      (field) => step === null || field.step === step,
    );

    missingFields.forEach((field) => {
      errors[field.key] = `${field.label} 항목을 입력해 주세요.`;
    });

    if (
      (step === null || step === 2) &&
      initialIssuedShares.trim() &&
      totalSharesAuthorized.trim() &&
      Number(initialIssuedShares) > Number(totalSharesAuthorized)
    ) {
      errors.initialIssuedShares =
        "설립 시 발행주식수는 발행가능주식총수보다 클 수 없습니다.";
    }

    return errors;
  };

  const getValidationIssues = (step = null) => {
    const errors = getValidationErrors(step);
    const missingFields = getMissingRequiredFields().filter(
      (field) => step === null || field.step === step,
    );
    const issues = missingFields.filter((field) => errors[field.key]);

    if (
      errors.initialIssuedShares &&
      !issues.some((issue) => issue.key === "initialIssuedShares")
    ) {
      issues.push({
        label: "설립 시 발행주식수",
        step: 2,
        key: "initialIssuedShares",
      });
    }

    return { errors, issues };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedStep = Math.min(currentStep, steps.length - 1);
    const isSubmitStep = steps[normalizedStep]?.id === "officers";

    if (!isSubmitStep) {
      goNextStep();
      return;
    }

    const { errors, issues: invalidFields } = getValidationIssues();

    if (invalidFields.length > 0) {
      setIsValidationActive(true);
      setFieldErrors(errors);
      setValidationIssues(invalidFields);
      setSubmitError("입력하지 않았거나 확인이 필요한 항목이 있습니다.");
      setCurrentStep(invalidFields[0].step);
      focusField(invalidFields[0].key);
      return;
    }

    setSubmitError("");
    setFieldErrors({});
    setValidationIssues([]);

    const articlesData = {
      source: hearingSheetData,
      content: buildArticlesContent(hearingSheetData),
      sections: buildArticlesSections(hearingSheetData),
    };

    // 이 단계에서는 서버로 전송하지 않고 최종 확인 화면으로만 이동합니다.
    navigate("/articles-result", {
      state: {
        articlesData,
      },
    });
  };

  const stepIds = ["company", "business", "finance", "founders", "officers"];
  const steps = ui.steps.map(([title, desc], index) => ({
    id: stepIds[index],
    title,
    desc,
    icon: String(index + 1).padStart(2, "0"),
  }));

  const safeCurrentStep = Math.min(currentStep, steps.length - 1);
  // 실시간 에러 감시 로직
  useEffect(() => {
    if (isValidationActive) {
      const isFinalStep = safeCurrentStep === steps.length - 1;
      const { errors, issues } = getValidationIssues(
        isFinalStep ? null : safeCurrentStep,
      );

      setFieldErrors(errors);
      setValidationIssues(isFinalStep ? issues : []);

      if (issues.length > 0) {
        setSubmitError("입력하지 않았거나 확인이 필요한 항목이 있습니다.");
      } else {
        setSubmitError("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    companyName,
    companyNameEn,
    headOfficeAddress,
    capital,
    totalSharesAuthorized,
    initialIssuedShares,
    bankName,
    branchName,
    representativeDirector,
    directorTerm,
    purposes,
    founders,
    directors,
    safeCurrentStep,
    isValidationActive,
  ]);
  const currentStepData = steps[safeCurrentStep] || steps[steps.length - 1];
  const isFinalInputStep = currentStepData.id === "officers";
  const progress = Math.round(((safeCurrentStep + 1) / steps.length) * 100);

  const goPrevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const goNextStep = () => {
    const { errors, issues: invalidFields } =
      getValidationIssues(safeCurrentStep);

    if (invalidFields.length > 0) {
      setIsValidationActive(true);
      setFieldErrors((current) => ({ ...current, ...errors }));
      setValidationIssues([]);
      setSubmitError(ui.currentRequired);
      focusField(invalidFields[0].key);
      return;
    }

    setIsValidationActive(false);
    setSubmitError("");
    setValidationIssues([]);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goToStep = (stepIndex) => {
    setSubmitError("");
    setValidationIssues([]);
    setIsValidationActive(false);
    setCurrentStep(stepIndex);
  };

  const goToValidationIssue = (issue) => {
    setCurrentStep(issue.step);
    window.setTimeout(() => focusField(issue.key), 60);
  };

  const renderTextInput = ({
    fieldKey,
    label,
    value,
    onChange,
    placeholder,
    helper,
    type = "text",
    required = true,
    wide = false,
    labelHidden = false,
  }) => {
    const id = toFieldId(fieldKey);
    const helperId = helper ? `${id}-helper` : undefined;

    return (
      <div className={`hsv-field ${wide ? "hsv-wide-field" : ""}`}>
        <label htmlFor={id} className={labelHidden ? "hsv-sr-only" : undefined}>
          {label}
          {required && (
            <span className="hsv-required-star" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          id={id}
          name={fieldKey}
          type={type}
          aria-required={required ? "true" : undefined}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (fieldErrors[fieldKey]) {
              setFieldErrors((current) => {
                const next = { ...current };
                delete next[fieldKey];
                return next;
              });
            }
          }}
          placeholder={placeholder}
          aria-invalid={fieldErrors[fieldKey] ? "true" : undefined}
          aria-describedby={getDescribedBy(fieldKey, helperId)}
        />
        {helper && (
          <p className="hsv-helper-text" id={helperId}>
            {helper}
          </p>
        )}
        {renderFieldError(fieldKey)}
      </div>
    );
  };

  const getFounderCardTitle = (founder, index) => {
    const count = index + 1;
    const roles = [];

    if (founder.isFounder) roles.push(ui.founder);
    if (founder.isInvestor) roles.push(ui.investor);

    return {
      title: `${ui.shareholders} ${count}`,
      roleTag: roles.length > 0 ? `(${roles.join("·")})` : "",
    };
  };

  const renderStepFields = () => {
    const activeStepIndex = safeCurrentStep;

    if (activeStepIndex === 0) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>
                <span className="hsv-section-number">01</span>
                {ui.sectionCompany}
              </h2>
            </div>
          </div>

          <div className="hsv-grid2">
            {renderTextInput({
              fieldKey: "companyName",
              label: t("hearing.companyName"),
              value: companyName,
              onChange: setCompanyName,
              placeholder: t("hearing.companyNamePlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "companyNameEn",
              label: ui.englishName,
              value: companyNameEn,
              onChange: setCompanyNameEn,
              placeholder: t("hearing.companyNameEnPlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "headOfficeAddress",
              label: t("hearing.headOfficeAddress"),
              value: headOfficeAddress,
              onChange: setHeadOfficeAddress,
              placeholder: t("hearing.headOfficeAddressPlaceholder"),
              wide: true,
            })}
          </div>
        </section>
      );
    }

    if (activeStepIndex === 1) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>
                <span className="hsv-section-number">02</span>
                {ui.sectionBusiness}
              </h2>
            </div>
            <button
              type="button"
              className="hsv-small-btn"
              onClick={addPurpose}
            >
              + 추가
            </button>
          </div>

          <div className="hsv-stack">
            {purposes.map((purpose, index) => (
              <div className="hsv-repeat-card hsv-purpose-card" key={index}>
                <div className="hsv-repeat-head">
                  <strong>사업 목적 {index + 1}</strong>
                  {purposes.length > 1 && (
                    <button
                      type="button"
                      className="hsv-icon-btn"
                      aria-label={`사업 목적 ${index + 1} 삭제`}
                      onClick={() => removePurpose(index)}
                    >
                      &minus;
                    </button>
                  )}
                </div>
                {renderTextInput({
                  fieldKey: `purposes.${index}.content`,
                  label: `사업 목적 ${index + 1}`,
                  value: purpose.content,
                  onChange: (value) => updatePurpose(index, value),
                  placeholder: ui.purposePlaceholder,
                  labelHidden: true,
                })}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeStepIndex === 2) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>
                <span className="hsv-section-number">03</span>
                {ui.sectionFinance}
              </h2>
            </div>
          </div>

          <div className="hsv-grid2">
            {renderTextInput({
              fieldKey: "bankName",
              label: t("hearing.bankName"),
              value: bankName,
              onChange: setBankName,
              placeholder: t("hearing.bankNamePlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "branchName",
              label: t("hearing.branchName"),
              value: branchName,
              onChange: setBranchName,
              placeholder: t("hearing.branchNamePlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "capital",
              label: t("hearing.capital"),
              value: capital,
              onChange: setCapital,
              placeholder: t("hearing.capitalPlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "totalSharesAuthorized",
              label: ui.authorizedShares,
              value: totalSharesAuthorized,
              onChange: setTotalSharesAuthorized,
              placeholder: t("hearing.totalSharesAuthorizedPlaceholder"),
            })}

            {renderTextInput({
              fieldKey: "initialIssuedShares",
              label: ui.initialShares,
              value: initialIssuedShares,
              onChange: setInitialIssuedShares,
              placeholder: t("hearing.initialIssuedSharesPlaceholder"),
              wide: true,
            })}
          </div>
        </section>
      );
    }

    if (activeStepIndex === 3) {
      return (
        <section className="hsv-form-card">
          <div className="hsv-card-head">
            <div>
              <h2>
                <span className="hsv-section-number">04</span>
                {ui.sectionShareholders}
              </h2>
            </div>
            <button
              type="button"
              className="hsv-small-btn"
              onClick={addFounder}
            >
              + 추가
            </button>
          </div>

          <div className="hsv-stack">
            {founders.map((founder, index) => {
              const founderTitle = getFounderCardTitle(founder, index);

              return (
                <div className="hsv-repeat-card" key={index}>
                  <div className="hsv-repeat-head">
                    <div className="hsv-repeat-title">
                      <strong>{founderTitle.title}</strong>
                      {founderTitle.roleTag && (
                        <span>{founderTitle.roleTag}</span>
                      )}
                    </div>
                    {founders.length > 1 && (
                      <button
                        type="button"
                        className="hsv-icon-btn"
                        aria-label={`발기인 ${index + 1} 삭제`}
                        onClick={() => removeFounder(index)}
                      >
                        &minus;
                      </button>
                    )}
                  </div>
                  <div className="hsv-grid2">
                    <div className="hsv-role-field">
                      <div className="hsv-role-label">
                        <span>
                          역할
                          <span
                            className="hsv-required-star"
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </span>
                        <small>{ui.multiple}</small>
                      </div>
                      <div
                        className="hsv-role-options"
                        aria-describedby={
                          fieldErrors[`founders.${index}.role`]
                            ? `${toFieldId(`founders.${index}.role`)}-error`
                            : undefined
                        }
                      >
                        <label className={founder.isFounder ? "is-active" : ""}>
                          <input
                            type="checkbox"
                            checked={Boolean(founder.isFounder)}
                            onChange={(event) =>
                              updateFounder(
                                index,
                                "isFounder",
                                event.target.checked,
                              )
                            }
                          />
                          <span>{ui.founder}</span>
                        </label>
                        <label
                          className={founder.isInvestor ? "is-active" : ""}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(founder.isInvestor)}
                            onChange={(event) =>
                              updateFounder(
                                index,
                                "isInvestor",
                                event.target.checked,
                              )
                            }
                          />
                          <span>{ui.investor}</span>
                        </label>
                      </div>
                      {renderFieldError(`founders.${index}.role`)}
                    </div>

                    {renderTextInput({
                      fieldKey: `founders.${index}.address`,
                      label: t("hearing.address"),
                      value: founder.address,
                      onChange: (value) =>
                        updateFounder(index, "address", value),
                      placeholder: t("hearing.addressPlaceholder"),
                    })}
                    {renderTextInput({
                      fieldKey: `founders.${index}.name`,
                      label: ui.name,
                      value: founder.name,
                      onChange: (value) => updateFounder(index, "name", value),
                      placeholder: t("hearing.namePlaceholder"),
                    })}
                    {renderTextInput({
                      fieldKey: `founders.${index}.investmentAmount`,
                      label: ui.investment,
                      value: founder.investmentAmount,
                      onChange: (value) =>
                        updateFounder(index, "investmentAmount", value),
                      placeholder: t("hearing.investmentPlaceholder"),
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    return (
      <section className="hsv-form-card">
        <div className="hsv-card-head">
          <div>
            <h2>
              <span className="hsv-section-number">05</span>
              {ui.sectionOfficers}
            </h2>
          </div>
        </div>

        <div className="hsv-subsection-head">
          <h3>{ui.representative}</h3>
        </div>
        <p className="hsv-section-hint">
          대표이사 정보는 이사 목록의 첫 번째 이사로 자동 등록됩니다.
        </p>

        <div className="hsv-repeat-card hsv-ceo-card">
          <div className="hsv-grid2">
            {renderTextInput({
              fieldKey: "directors.0.name",
              label: ui.name,
              value: directors[0]?.name || "",
              onChange: (value) => updateDirector(0, "name", value),
              placeholder: t("hearing.namePlaceholder"),
            })}
            {renderTextInput({
              fieldKey: "directors.0.address",
              label: t("hearing.address"),
              value: directors[0]?.address || "",
              onChange: (value) => updateDirector(0, "address", value),
              placeholder: t("hearing.addressPlaceholder"),
            })}
            {renderTextInput({
              fieldKey: "directors.0.romanizedName",
              label: ui.romanized,
              value: directors[0]?.romanizedName || "",
              onChange: (value) => updateDirector(0, "romanizedName", value),
              placeholder: t("hearing.romanizedNamePlaceholder"),
            })}
            {renderTextInput({
              fieldKey: "directorTerm",
              label: ui.term,
              value: directorTerm,
              onChange: setDirectorTerm,
              placeholder: t("hearing.directorTermPlaceholder"),
            })}
          </div>
        </div>

        <div className="hsv-subsection-head hsv-additional-directors-head">
          <div>
            <h3>{ui.additionalDirectors}</h3>
            <p>{ui.optionalDirectors}</p>
          </div>
          <button type="button" className="hsv-small-btn" onClick={addDirector}>
            + 추가
          </button>
        </div>

        {directors.length > 1 && (
          <div className="hsv-stack">
            {directors.slice(1).map((director, index) => {
              const directorIndex = index + 1;

              return (
                <div className="hsv-repeat-card" key={directorIndex}>
                  <div className="hsv-repeat-head">
                    <strong>이사 {directorIndex + 1}</strong>
                    <button
                      type="button"
                      className="hsv-icon-btn"
                      aria-label={`이사 ${directorIndex + 1} 삭제`}
                      onClick={() => removeDirector(directorIndex)}
                    >
                      &minus;
                    </button>
                  </div>
                  <div className="hsv-grid2">
                    {renderTextInput({
                      fieldKey: `directors.${directorIndex}.name`,
                      label: ui.name,
                      value: director.name,
                      onChange: (value) =>
                        updateDirector(directorIndex, "name", value),
                      placeholder: t("hearing.namePlaceholder"),
                    })}
                    {renderTextInput({
                      fieldKey: `directors.${directorIndex}.address`,
                      label: t("hearing.address"),
                      value: director.address,
                      onChange: (value) =>
                        updateDirector(directorIndex, "address", value),
                      placeholder: t("hearing.addressPlaceholder"),
                    })}
                    {renderTextInput({
                      fieldKey: `directors.${directorIndex}.romanizedName`,
                      label: ui.romanized,
                      value: director.romanizedName,
                      onChange: (value) =>
                        updateDirector(directorIndex, "romanizedName", value),
                      placeholder: t("hearing.romanizedNamePlaceholder"),
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="hsv-page">
      <Header isLoggedIn={isLoggedIn} />

      <div className="hsv-shell">
        <main className="hsv-main">
          <section className="hsv-content">
            <div className="hsv-hero">
              <div>
                <p className="hsv-time">{ui.pageTitle}</p>
                <h1>{ui.pageTitle}</h1>
                <p>{ui.intro}</p>
              </div>
            </div>

            <div className="hsv-progress-panel">
              <div className="hsv-progress-head">
                <strong>{ui.progress}</strong>
                <span>
                  {safeCurrentStep + 1}/{steps.length} · {currentStepData.title}
                </span>
              </div>

              <div className="hsv-mobile-step-summary" aria-live="polite">
                <strong>
                  {safeCurrentStep + 1}/{steps.length} · {currentStepData.title}
                </strong>
                <p>{currentStepData.desc}</p>
              </div>

              <div className="hsv-stepper" role="list" aria-label={ui.stepper}>
                {steps.map((step, index) => {
                  const state =
                    index === safeCurrentStep
                      ? "active"
                      : index < safeCurrentStep
                        ? "completed"
                        : "";

                  return (
                    <button
                      type="button"
                      key={step.title}
                      className={`hsv-stepper-item ${state}`}
                      title={step.desc}
                      aria-current={
                        index === safeCurrentStep ? "step" : undefined
                      }
                      onClick={() => goToStep(index)}
                    >
                      <i>{String(index + 1).padStart(2, "0")}</i>
                      <strong>{step.title}</strong>
                    </button>
                  );
                })}
              </div>

              <div className="hsv-progress-track" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <form className="hsv-form" onSubmit={handleSubmit}>
              {/* 기존 입력/제출 기능은 유지하고, Visily 프레임처럼 단계별 화면으로만 재배치합니다. */}
              {requiredNotice}
              {renderStepFields()}

              {submitError && (
                <div className="hsv-validation-summary" role="alert">
                  <p>{submitError}</p>
                  {validationIssues.length > 0 && (
                    <ul>
                      {validationIssues.map((issue) => (
                        <li key={issue.key}>
                          <button
                            type="button"
                            onClick={() => goToValidationIssue(issue)}
                          >
                            {steps[issue.step].title}: {issue.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="hsv-actions">
                <button
                  type="button"
                  className="hsv-secondary-btn"
                  onClick={goPrevStep}
                  disabled={safeCurrentStep === 0}
                >
                  {ui.previous}
                </button>

                {!isFinalInputStep ? (
                  <button
                    type="button"
                    className="hsv-primary-btn"
                    onClick={goNextStep}
                  >
                    {ui.next}
                  </button>
                ) : (
                  <button type="submit" className="hsv-primary-btn">
                    {ui.final}
                  </button>
                )}
              </div>
            </form>
          </section>

        </main>
      </div>
    </div>
  );
}
