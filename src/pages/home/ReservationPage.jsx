import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import "../../App.css";
import Header from "../../components/Header";
import YearMonthPicker from "../../components/YearMonthPicker";
import "../../styles/reservation-visily.css";
import {
  createReservation,
  getReservationListByRange,
} from "../../api/reservationApi";
import {
  formatTranslatedDate,
  formatTranslatedMonth,
  getCurrentLanguage,
  translate,
} from "../../i18n/translations";

const WEEK_DAYS = [
  "weekdaySun",
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
];

const TIME_OPTIONS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const FIELD_OPTIONS = [
  { labelKey: "fieldHr", value: "hr" },
  { labelKey: "fieldLabor", value: "labor" },
  { labelKey: "fieldAccounting", value: "accounting" },
  { labelKey: "fieldLaw", value: "law" },
];

const STAGE_OPTIONS = [
  {
    id: "market",
    title: "시장 조사",
    subtitle: "타깃 고객, 경쟁사, 초기 진출 가능성 검토",
    field: "accounting",
    recommendedExpert: "kim",
  },
  {
    id: "entity",
    title: "법인 설립",
    subtitle: "정관, 등기, 인감, 설립 절차 검토",
    field: "law",
    recommendedExpert: "kanemura",
  },
  {
    id: "tax",
    title: "세무 · 회계",
    subtitle: "기장, 결산, 세무 신고와 운영 구조 상담",
    field: "accounting",
    recommendedExpert: "kim",
  },
  {
    id: "labor",
    title: "노무 · 비자",
    subtitle: "채용, 사회보험, 비자 발급 가능성 검토",
    field: "law",
    recommendedExpert: "kanemura",
  },
];

const CONSULT_TYPES = [
  {
    id: "online",
    title: "온라인 상담",
    subtitle: "Zoom 또는 Google Meet으로 진행",
  },
  {
    id: "offline",
    title: "오프라인 상담",
    subtitle: "Tokyo Office 방문 상담",
  },
];

const MONTHS_TO_FETCH = 7;

function isSameDate(a, b) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDate(date, today) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return target < base;
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function getDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimeKey(timeValue) {
  return String(timeValue || "").slice(0, 5);
}

function getMonthStartIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01T00:00:00.000Z`;
}

function addTwoHourBlock(blockedSet, time) {
  if (time) {
    blockedSet.add(time);
  }

  const index = TIME_OPTIONS.indexOf(time);
  if (index === -1) return;

  blockedSet.add(TIME_OPTIONS[index]);

  if (TIME_OPTIONS[index + 1]) {
    blockedSet.add(TIME_OPTIONS[index + 1]);
  }
}

function getLocalDateIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T00:00:00.000Z`;
}

export default function ReservationPage() {
  const language = getCurrentLanguage();
  const t = (key, variables) => translate(language, key, variables);

  const today = useMemo(() => new Date(), []);

  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [requestYear, setRequestYear] = useState(today.getFullYear());

  const [requestMonth, setRequestMonth] = useState(
    today.getMonth() + 1
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStage, setSelectedStage] = useState(STAGE_OPTIONS[0].id);
  const [selectedField, setSelectedField] = useState(STAGE_OPTIONS[0].field);
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [consultType, setConsultType] = useState(CONSULT_TYPES[0].id);
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    CName: "",
    kind: "",
  });

  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [listError, setListError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    setIsLoggedIn(!!token);
    setIsAdmin(role === "admin");
  }, []);

  useEffect(() => {
    const fetchReservationList = async () => {
      try {
        setListError("");

        const data = await getReservationListByRange(
          getMonthStartIso(viewDate),
          MONTHS_TO_FETCH
        );

        setSchedules(data.schedules || []);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("예약 일정 조회 실패:", err);
        setListError(
          err.message || translate(language, "reservation.listLoadError")
        );
      }
    };

    if (isLoggedIn === true && !isAdmin) {
      fetchReservationList();
    }
  }, [isLoggedIn, isAdmin, viewDate, language]);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const blockedTimes = useMemo(() => {
    const blocked = new Set();

    if (!selectedField) {
      return blocked;
    }

    const selectedDateKey = getDateKey(selectedDate);

    schedules.forEach((item) => {
      const itemDateKey = getDateKey(item.selected_date);
      const itemTime = getTimeKey(item.selected_time);

      const isSameField = item.field === selectedField;

      const isTakenReservation = item.approved;

      const isBlockedSchedule = item.block;

      if (
        itemDateKey === selectedDateKey &&
        isSameField &&
        (isTakenReservation || isBlockedSchedule)
      ) {
        addTwoHourBlock(blocked, itemTime);
      }
    });

    blocks.forEach((item) => {
      const itemDateKey = getDateKey(item.blocked_date);
      const itemTime = getTimeKey(item.blocked_time);

      const isSameField =
        item.field === null || item.field === selectedField;

      if (itemDateKey === selectedDateKey && isSameField) {
        addTwoHourBlock(blocked, itemTime);
      }
    });

    return blocked;
  }, [schedules, blocks, selectedDate, selectedField]);

  const timeOptions = useMemo(() => {
    if (!selectedTime || TIME_OPTIONS.includes(selectedTime)) {
      return TIME_OPTIONS;
    }

    return [...TIME_OPTIONS, selectedTime].sort();
  }, [selectedTime]);

  const moveToMonth = (date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    setViewDate(nextMonth);
    setRequestYear(nextMonth.getFullYear());
    setRequestMonth(nextMonth.getMonth() + 1);
    setSelectedDate(null);
    setSelectedTime("");
    setIsSubmitted(false);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handlePrevMonth = () => {
    moveToMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    moveToMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleRefreshReservationList = async () => {
    if (!requestMonth) {
      setListError(t("reservation.selectMonthError"));
      return;
    }

    const nextMonth = new Date(requestYear, requestMonth - 1, 1);

    try {
      setIsRefreshingList(true);
      setListError("");
      setSubmitSuccess("");

      setViewDate(nextMonth);
      setSelectedDate(null);
      setSelectedTime("");
      setIsSubmitted(false);

      const data = await getReservationListByRange(
        getMonthStartIso(nextMonth),
        MONTHS_TO_FETCH
      );

      setSchedules(data.schedules || []);
      setBlocks(data.blocks || []);
    } catch (err) {
      console.error("예약 일정 재조회 실패:", err);
      setListError(err.message || t("reservation.listRefreshError"));
    } finally {
      setIsRefreshingList(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitted(false);
  };

  const handleStageSelect = (stage) => {
    setSelectedStage(stage.id);
    setSelectedField(stage.field);
    setSelectedExpertId(null);
    setSelectedTime("");
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitted(false);
  };

  const handlePrevStep = () => {
    setSubmitError("");
    setSubmitSuccess("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleNextStep = () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (currentStep === 1) {
      if (!form.name.trim()) {
        setSubmitError("이름을 입력해 주세요.");
        return;
      }

      if (!form.CName.trim()) {
        setSubmitError(t("reservation.companyError"));
        return;
      }

      if (!form.kind.trim()) {
        setSubmitError(t("reservation.kindError"));
        return;
      }

      if (!form.phone.trim()) {
        setSubmitError(t("reservation.phoneError"));
        return;
      }

      if (!form.email.trim()) {
        setSubmitError("이메일을 입력해 주세요.");
        return;
      }
    }

    if (currentStep === 2 && (!consultType || !selectedExpertId)) {
      setSubmitError(
        !consultType
          ? "상담 방식을 선택해 주세요."
          : "상담할 전문가를 선택해 주세요."
      );
      return;
    }

    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleDateClick = (date, isPast, isToday) => {
    if (isPast && !isToday) return;

    setSelectedDate(date);
    setSelectedTime("");
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!form.phone.trim()) {
      setSubmitError(t("reservation.phoneError"));
      return;
    }

    if (!form.CName.trim()) {
      setSubmitError(t("reservation.companyError"));
      return;
    }

    if (!form.kind.trim()) {
      setSubmitError(t("reservation.kindError"));
      return;
    }

    if (!selectedField) {
      setSubmitError(t("reservation.fieldError"));
      return;
    }

    if (!selectedDate || !selectedTime) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    if (blockedTimes.has(selectedTime)) {
      setSubmitError(t("reservation.blockedError"));
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await createReservation({
        phone: form.phone.trim(),
        CName: form.CName.trim(),
        kind: form.kind.trim(),
        field: selectedField,
        selectedDate: getLocalDateIso(selectedDate),
        selectedTime,
      });

      if (data.success) {
        setSubmitSuccess(t("reservation.submitSuccess"));
        setIsSubmitted(true);

        const listData = await getReservationListByRange(
          getMonthStartIso(viewDate),
          MONTHS_TO_FETCH
        );

        setSchedules(listData.schedules || []);
        setBlocks(listData.blocks || []);
      } else {
        setSubmitSuccess(t("reservation.submitFallbackSuccess"));
        setIsSubmitted(true);
      }
    } catch (err) {
      setSubmitError(err.message || t("reservation.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn === null) {
    return <div>{t("common.loading")}</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/calendar" replace />;
  }

  const selectedFieldOption = FIELD_OPTIONS.find(
    (item) => item.value === selectedField
  );
  const selectedFieldLabel = selectedFieldOption
    ? t(`reservation.${selectedFieldOption.labelKey}`)
    : t("common.notSelected");

  const expertProfiles = [
    {
      field: "accounting",
      id: "kim",
      name: "김명구 회계사",
      title: "일본 세무 · 회계 전문가",
      description:
        "일본 법인 설립 이후 회계, 세무 신고, 자금 흐름 검토가 필요한 기업을 지원합니다.",
      tags: ["세무", "회계", "일본 법인"],
      rating: "5.0",
      reviews: "89",
      avatar: "K",
    },
    {
      field: "law",
      id: "kanemura",
      name: "카네무라 미츠아키",
      title: "사법서사 · 행정서사",
      description:
        "회사 설립, 비자 취득, 정관 및 등기 절차처럼 법무 판단이 필요한 상담을 담당합니다.",
      tags: ["회사 설립", "비자", "등기"],
      rating: "4.9",
      reviews: "124",
      avatar: "G",
    },
  ];

  const selectedStageOption =
    STAGE_OPTIONS.find((stage) => stage.id === selectedStage) ||
    STAGE_OPTIONS[0];

  const selectedExpert =
    expertProfiles.find((expert) => expert.id === selectedExpertId) || null;

  const selectedConsultType =
    CONSULT_TYPES.find((type) => type.id === consultType) || CONSULT_TYPES[0];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="rv-page">
        <aside className="rv-sidebar">
        <Link to="/" className="rv-logo">
          <span>◎</span>
          <strong>WVA AI Consulting</strong>
          <small>Japan Entry OS</small>
        </Link>

        <nav className="rv-side-nav">
          <Link to="/">Home</Link>
          <Link to="/hearing-sheet">Hearing Sheet</Link>
          <Link to="/articles-result">Articles</Link>
          <Link to="/reservation" className="active">
            Consultations
          </Link>
          <Link to="/myreservations">My Reservations</Link>
          <Link to="/chat">AI Chatbot</Link>
        </nav>

        <div className="rv-sidebar-bottom">
          <Link to="/admin/calendar">Admin Dashboard</Link>
          <span>WVA Japan Entry OS</span>
        </div>
        </aside>

      <div className="rv-shell">
        <header className="rv-topbar">
          <div className="rv-breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <strong>Consultation Booking</strong>
          </div>

          <div className="rv-top-actions">
            <div className="rv-search-box">
              <span>⌕</span>
              <input type="text" placeholder="문서 또는 전문가 검색..." />
            </div>
            <Link to="/myreservations" className="rv-top-link">
              내 예약 보기
            </Link>
            <span className="rv-user-dot">M</span>
          </div>
        </header>

        <main className="rv-main">
          <section className="rv-content">
            <div className="rv-hero">
              <div>
                <h1>상담예약</h1>
                <p>
                  원하는 상담 분야와 가능한 시간대를 선택하면 예약 신청이
                  접수됩니다. 담당 전문가는 신청 내용을 확인한 뒤 승인 또는
                  거절 상태를 안내합니다.
                </p>
              </div>
            </div>

            <div className="rv-stepper" aria-label="예약 진행 상태">
              <span className={currentStep >= 1 ? "active" : ""}>1</span>
              <strong>기본 정보 · 진출 단계</strong>
              <i />
              <span className={currentStep >= 2 ? "active" : ""}>2</span>
              <strong>상담 방식 · 전문가</strong>
              <i />
              <span className={currentStep >= 3 ? "active" : ""}>3</span>
              <strong>일정 선택</strong>
              <i />
              <span className={currentStep >= 4 ? "active" : ""}>4</span>
              <strong>승인 요청</strong>
            </div>

            <section className="rv-approval-flow" aria-label="예약 승인 흐름">
              <div>
                <span>01</span>
                <strong>상담 분야 선택</strong>
                <p>법무, 회계, 노무, 시장 진출 준비 중 필요한 상담 분야를 고릅니다.</p>
              </div>
              <div>
                <span>02</span>
                <strong>가능 시간대 체크</strong>
                <p>이미 승인되었거나 차단된 시간은 예약 불가로 표시됩니다.</p>
              </div>
              <div>
                <span>03</span>
                <strong>전문가 승인 대기</strong>
                <p>신청 후 바로 확정되지 않고, 전문가 확인 후 상태가 변경됩니다.</p>
              </div>
            </section>

            {currentStep === 1 && (
              <section className="rv-panel rv-basic-panel rv-step-screen">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 01</span>
                    <h2>진출 단계 및 신청자 정보</h2>
                  </div>
                </div>

                <div className="rv-basic-stage rv-basic-stage-top">
                  <div className="rv-section-head">
                    <span>Entry Stage</span>
                    <h2>진출 희망 단계</h2>
                    <p>
                      현재 준비 중인 단계를 선택하면 상담 분야와 추천 전문가가
                      자동으로 정리됩니다.
                    </p>
                  </div>

                  <div className="rv-stage-grid">
                    {STAGE_OPTIONS.map((stage) => (
                      <button
                        type="button"
                        key={stage.id}
                        className={[
                          "rv-stage-card",
                          selectedStage === stage.id ? "selected" : "",
                        ].join(" ")}
                        onClick={() => handleStageSelect(stage)}
                      >
                        <span>{stage.title}</span>
                        <strong>{stage.subtitle}</strong>
                      </button>
                    ))}
                  </div>

                  <div className="rv-stage-strip">
                    <span>현재 선택</span>
                    <strong>{selectedStageOption.title}</strong>
                    <small>|</small>
                    <small>{selectedStageOption.subtitle}</small>
                  </div>
                </div>

                <div className="rv-form-title">
                  <strong>신청자 정보 입력</strong>
                  <small>상담 안내와 승인 결과를 받을 정보를 입력해 주세요.</small>
                </div>

                <div className="rv-form rv-basic-form">
                  <label>
                    <span>{t("reservation.name")}</span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t("reservation.name")}
                    />
                  </label>

                  <label>
                    <span>{t("reservation.company")}</span>
                    <input
                      type="text"
                      name="CName"
                      value={form.CName}
                      onChange={handleChange}
                      placeholder={t("reservation.company")}
                    />
                  </label>

                  <label>
                    <span>{t("reservation.job")}</span>
                    <input
                      type="text"
                      name="kind"
                      value={form.kind}
                      onChange={handleChange}
                      placeholder={t("reservation.job")}
                    />
                  </label>

                  <label>
                    <span>{t("reservation.phone")}</span>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="010-0000-0000"
                    />
                  </label>

                  <label>
                    <span>{t("reservation.email")}</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                    />
                  </label>
                </div>

                <div className="rv-step-actions">
                  <button type="button" className="rv-step-next" onClick={handleNextStep}>
                    다음 단계
                    <span>→</span>
                  </button>
                </div>
              </section>
            )}

            {currentStep === 2 && (
            <section className="rv-expert-section rv-step-screen">
              <div className="rv-section-head">
                <span>Step 02</span>
                <h2>상담 방식 및 전문가 선택</h2>
                <p>
                  상담을 온라인 또는 오프라인으로 진행할지 선택하고, 추천된
                  전문가 중 상담할 담당자를 고릅니다.
                </p>
              </div>

              <div className="rv-consult-type-grid">
                {CONSULT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    className={[
                      "rv-consult-type-card",
                      consultType === type.id ? "selected" : "",
                    ].join(" ")}
                    onClick={() => {
                      setConsultType(type.id);
                      setSubmitError("");
                      setSubmitSuccess("");
                      setIsSubmitted(false);
                    }}
                  >
                    <span>{type.title}</span>
                    <strong>{type.subtitle}</strong>
                  </button>
                ))}
              </div>

              <div className="rv-expert-list compact">
                {expertProfiles.map((expert) => (
                  <button
                    type="button"
                    key={expert.id}
                    className={[
                      "rv-expert-card",
                      selectedExpertId === expert.id ? "selected" : "",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedExpertId(expert.id);
                      setSelectedField(expert.field);
                      setSelectedTime("");
                      setSubmitError("");
                      setSubmitSuccess("");
                      setIsSubmitted(false);
                    }}
                  >
                    <span className="rv-expert-avatar">{expert.avatar}</span>

                    <span className="rv-expert-copy">
                      <strong>{expert.name}</strong>
                      <em>{expert.title}</em>
                      <small>{expert.description}</small>
                      <span className="rv-expert-tags">
                        {expert.tags.map((tag) => (
                          <b key={tag}>{tag}</b>
                        ))}
                      </span>
                    </span>

                    <span className="rv-expert-rating">
                      승인 검토
                      <small> 평균 {expert.rating}</small>
                    </span>
                  </button>
                ))}
              </div>

              <label className="rv-additional-request">
                <span>추가 요청</span>
                <textarea
                  value={additionalRequest}
                  onChange={(e) => {
                    setAdditionalRequest(e.target.value);
                    setSubmitError("");
                    setSubmitSuccess("");
                    setIsSubmitted(false);
                  }}
                  rows="4"
                  placeholder="상담 시 집중적으로 다루고 싶은 내용이나 현재 고민을 입력해 주세요."
                />
              </label>

              <div className="rv-step-actions">
                <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                  이전 단계
                </button>
                <button type="button" className="rv-step-next" onClick={handleNextStep}>
                  다음 단계
                  <span>→</span>
                </button>
              </div>
            </section>
            )}

            {currentStep === 3 && (
            <div className="rv-workspace">
              <section className="rv-panel rv-calendar-panel">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 03</span>
                    <h2>가능 날짜 확인</h2>
                  </div>
                  <div className="rv-month-tools">
                    <YearMonthPicker
                      year={requestYear}
                      month={requestMonth}
                      onChangeYear={setRequestYear}
                      onChangeMonth={setRequestMonth}
                      startYear={today.getFullYear()}
                      yearCount={8}
                    />
                    <button
                      type="button"
                      onClick={handleRefreshReservationList}
                      disabled={isRefreshingList}
                    >
                      {isRefreshingList
                        ? t("reservation.refreshing")
                        : t("reservation.refresh")}
                    </button>
                  </div>
                </div>

                <div className="rv-calendar-nav">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label={t("reservation.previousMonth")}
                  >
                    ‹
                  </button>
                  <strong>{formatTranslatedMonth(language, viewDate)}</strong>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label={t("reservation.nextMonth")}
                  >
                    ›
                  </button>
                </div>

                <div className="rv-calendar-board">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="rv-weekday">
                      {t(`reservation.${day}`)}
                    </div>
                  ))}

                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="rv-day empty" />;
                    }

                    const isSelected = isSameDate(date, selectedDate);
                    const isPast = isPastDate(date, today);
                    const isToday = isSameDate(date, today);
                    const isDisabled = isPast && !isToday;

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={isDisabled}
                        className={[
                          "rv-day",
                          isSelected ? "selected" : "",
                          isToday ? "today" : "",
                          isDisabled ? "disabled" : "",
                        ].join(" ")}
                        onClick={() => handleDateClick(date, isPast, isToday)}
                      >
                        <span>{date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rv-panel">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 03</span>
                    <h2>가능 시간대 선택</h2>
                  </div>
                  <small>불가능한 시간은 자동으로 비활성화됩니다</small>
                </div>

                <div className="rv-time-grid">
                  {timeOptions.map((time) => {
                    const blocked = blockedTimes.has(time);

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={blocked}
                        className={[
                          selectedTime === time ? "selected" : "",
                          blocked ? "blocked" : "",
                        ].join(" ")}
                        onClick={() => {
                          if (!blocked) {
                            setSelectedTime(time);
                            setIsSubmitted(false);
                          }
                        }}
                      >
                        <strong>{time}</strong>
                        <span>{blocked ? "예약 불가" : "예약 가능"}</span>
                      </button>
                    );
                  })}
                </div>

              </section>

              <div className="rv-step-actions rv-step-actions-wide">
                <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                  이전 단계
                </button>
                <button type="button" className="rv-step-next" onClick={handleNextStep}>
                  다음 단계
                  <span>→</span>
                </button>
              </div>
            </div>
            )}

            {currentStep === 4 && (
              <section className="rv-panel rv-review-panel rv-step-screen">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 04</span>
                    <h2>예약 신청 내용 확인</h2>
                  </div>
                  <small>오른쪽 요약을 확인한 뒤 한 번만 승인 요청을 보내세요.</small>
                </div>

                <p className="rv-review-note">
                  선택한 상담 분야, 전문가, 일정과 신청자 정보는 오른쪽 예약 요약에
                  표시됩니다. 내용을 확인한 뒤 아래 버튼으로 신청을 완료해 주세요.
                </p>

                <div className="rv-step-actions">
                  <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                    이전 단계
                  </button>
                  <button
                    type="button"
                    className="rv-step-next"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("common.sending") : "전문가 승인 요청하기"}
                    <span>→</span>
                  </button>
                </div>
              </section>
            )}
          </section>

          <aside className="rv-summary-panel">
            <div className="rv-summary-head">
              <h2>예약 요약</h2>
              <div className="rv-summary-expert">
                <span className="rv-expert-avatar">
                  {selectedExpert ? selectedExpert.avatar : "?"}
                </span>
                <div>
                  <strong>{selectedExpert ? selectedExpert.name : "-"}</strong>
                  <small>
                    {selectedExpert
                      ? selectedExpert.title
                      : "Step 02에서 전문가를 선택해 주세요"}
                  </small>
                </div>
              </div>
            </div>

            <div className="rv-selected-summary">
              <div>
                <span>진출 희망 단계</span>
                <strong>{selectedStageOption.title}</strong>
              </div>
              <div>
                <span>상담 분야</span>
                <strong>{selectedFieldLabel}</strong>
              </div>
              <div>
                <span>상담 방식</span>
                <strong>{selectedConsultType.title}</strong>
              </div>
              <div>
                <span>예약 상태</span>
                <strong className={isSubmitted ? "rv-status-pending" : "rv-status-draft"}>
                  {isSubmitted ? "승인 대기 신청" : "작성 중"}
                </strong>
              </div>
              <div>
                <span>{t("reservation.date")}</span>
                <strong>
                  {selectedDate
                    ? formatTranslatedDate(language, selectedDate)
                    : t("common.notSelected")}
                </strong>
              </div>
              <div>
                <span>{t("reservation.time")}</span>
                <strong>{selectedTime || t("common.notSelected")}</strong>
              </div>
              <div>
                <span>신청자</span>
                <strong>{form.name.trim() || "미입력"}</strong>
              </div>
              <div>
                <span>회사명</span>
                <strong>{form.CName.trim() || "미입력"}</strong>
              </div>
              <div>
                <span>연락처</span>
                <strong>{form.phone.trim() || "미입력"}</strong>
              </div>
              <div>
                <span>이메일</span>
                <strong>{form.email.trim() || "미입력"}</strong>
              </div>
              <div>
                <span>직책/상담 종류</span>
                <strong>{form.kind.trim() || "미입력"}</strong>
              </div>
              <div>
                <span>추가 요청</span>
                <strong>{additionalRequest.trim() || "미입력"}</strong>
              </div>
            </div>

            <div className="rv-cost-box">
              <span>상담 비용</span>
              <strong>상담 후 안내</strong>
              <p>
                예약 신청은 상담 확정이 아닙니다. 전문가가 신청 내용을 확인한
                뒤 최종 승인 여부와 비용 범위를 안내합니다.
              </p>
            </div>

            {listError && <p className="rv-error">{listError}</p>}
            {submitError && <p className="rv-error">{submitError}</p>}
            {submitSuccess && <p className="rv-success">{submitSuccess}</p>}

            <div className="rv-summary-progress" aria-label="예약 작성 진행 상태">
              <span>예약 작성 진행</span>
              <strong>{currentStep}/4 단계</strong>
              <i aria-hidden="true">
                <b style={{ width: `${currentStep * 25}%` }} />
              </i>
            </div>

            <div className="rv-advisory">
              <strong>승인 방식 안내</strong>
              <p>
                신청한 시간은 전문가가 승인해야 최종 확정됩니다. 상담 전
                히어링 시트를 작성하면 승인 검토와 상담 준비가 더 빨라집니다.
              </p>
              <Link
                to="/hearing-sheet"
                title="상담 전에 회사와 설립 정보를 정리하면 전문가 검토가 더 빨라집니다."
                aria-label="상담 준비를 위한 히어링 시트 작성으로 이동"
              >
                히어링 시트 작성
              </Link>
            </div>
            </aside>
          </main>
        </div>
      </div>
    </>
  );
}
