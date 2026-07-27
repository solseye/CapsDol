import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import "../../App.css";
import Header from "../../components/Header";
import "../../styles/reservation-visily.css";
import {
  createReservation,
  getReservationListByRange,
} from "../../api/reservationApi";
import {
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

const CONSULTATION_DURATION_MINUTES = 120;

const API_FIELD_VALUES = {
  hr: "인사",
  labor: "노무",
  accounting: "회계",
  law: "법무",
};

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


function getMonthStartIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}


function addMinutesToTime(time, minutesToAdd) {
  const [hour, minute] = String(time).split(":").map(Number);

  const totalMinutes = hour * 60 + minute + minutesToAdd;

  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
}

function getWeekDates(dateValue) {
  const date = new Date(dateValue);
  const start = new Date(date);
  // Monday is the first column so a work-week reads naturally for consultations.
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
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

  const [currentStep, setCurrentStep] = useState(1);
  // 상담 분야는 진출 단계가 아니라 Step 02에서 선택한 전문가 기준으로 정합니다.
  const [selectedField, setSelectedField] = useState("");
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [consultType, setConsultType] = useState(CONSULT_TYPES[0].id);
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  // 여러 후보 시간을 함께 제안하기 위한 예약 범위 목록입니다.
  const [selectedRanges, setSelectedRanges] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    CName: "",
    kind: "",
  });

  const [blocks, setBlocks] = useState([]);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [listError, setListError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

        const data = await getReservationListByRange({
          baseDate: getMonthStartIso(viewDate),
          previousMonthCount: 2,
          nextMonthCount: 4,
        });

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

  const getBlockedTimesForDate = (dateValue) => {
    const blocked = new Set();

    if (!dateValue) return blocked;

    const dateKey = getDateKey(dateValue);

    blocks.forEach((block) => {
      if (block.unavailable_date !== dateKey) return;

      if (
        block.field &&
        API_FIELD_VALUES[selectedField] !== block.field
      )
        return;

      const start = block.start_time.slice(0, 5);
      const end = block.end_time.slice(0, 5);

      TIME_OPTIONS.forEach((time) => {
        const endTime = addMinutesToTime(
          time,
          CONSULTATION_DURATION_MINUTES
        );

        const overlap =
          !(endTime <= start || time >= end);

        if (overlap) {
          blocked.add(time);
        }
      });
    });

    return blocked;
  };

  const scheduleWeekDays = useMemo(
    () => getWeekDates(selectedDate || viewDate),
    [selectedDate, viewDate]
  );

  const moveToMonth = (date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    setViewDate(nextMonth);
    setSelectedDate(null);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
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

    if (currentStep === 3 && selectedRanges.length === 0) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleDateClick = (date, isPast, isToday) => {
    if (isPast && !isToday) return;

    setSelectedDate(date);
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

    if (selectedRanges.length === 0) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    try {
      setIsSubmitting(true);

      const apiField = API_FIELD_VALUES[selectedField];

      const data = await createReservation({
        phone: form.phone.trim(),
        companyName: form.CName.trim(),
        kind: form.kind.trim(),
        field: apiField,
        note: additionalRequest,
        availableRanges: selectedRanges,
      });

      if (data.success) {
        setSubmitSuccess(t("reservation.submitSuccess"));
        setIsSubmitted(true);

        const listData = await getReservationListByRange({
          baseDate: getMonthStartIso(viewDate),
          previousMonthCount: 2,
          nextMonthCount: 4,
        });

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

  const toggleTimeRange = (time, dateValue = selectedDate) => {
    if (!dateValue) {
      setSubmitError("먼저 날짜를 선택해 주세요.");
      return;
    }

    if (getBlockedTimesForDate(dateValue).has(time)) return;

    const date = getDateKey(dateValue);
    setSelectedDate(new Date(dateValue));
    const range = {
      date,
      startTime: time,
      endTime: addMinutesToTime(time, CONSULTATION_DURATION_MINUTES),
    };

    setSelectedRanges((prev) => {
      const exists = prev.some(
        (item) => item.date === range.date && item.startTime === range.startTime
      );

      if (exists) {
        return prev.filter(
          (item) => !(item.date === range.date && item.startTime === range.startTime)
        );
      }

      return [...prev, range].sort(
        (a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
      );
    });
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitted(false);
  };

  const removeTimeRange = (range) => {
    setSelectedRanges((prev) =>
      prev.filter(
        (item) => !(item.date === range.date && item.startTime === range.startTime)
      )
    );
    setIsSubmitted(false);
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
              <strong>기본 정보 · 상담 방식</strong>
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
                    <h2>상담 방식 및 신청자 정보</h2>
                  </div>
                </div>

                <div className="rv-basic-stage rv-basic-stage-top">
                  <div className="rv-section-head">
                    <span>Consultation Type</span>
                    <h2>상담 방식</h2>
                    <p>온라인 또는 오프라인 상담 방식을 선택해 주세요.</p>
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
                      setSelectedRanges([]);
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
              <div className="rv-schedule-layout">
                <section className="rv-schedule-card rv-schedule-month">
                  <div className="rv-schedule-eyebrow">STEP 03</div>
                  <div className="rv-schedule-month-title">
                    <strong>{formatTranslatedMonth(language, viewDate)}</strong>
                    <span>날짜를 먼저 선택해 주세요</span>
                  </div>
                  <div className="rv-schedule-month-nav">
                    <button type="button" onClick={handlePrevMonth} aria-label={t("reservation.previousMonth")}>‹</button>
                    <button type="button" onClick={handleNextMonth} aria-label={t("reservation.nextMonth")}>›</button>
                  </div>
                  <div className="rv-schedule-calendar">
                    {WEEK_DAYS.slice(1).concat(WEEK_DAYS[0]).map((day) => (
                      <span key={day}>{t(`reservation.${day}`)}</span>
                    ))}
                    {calendarDays.map((date, index) => {
                      if (!date) return <span key={`empty-${index}`} className="rv-schedule-date empty" />;
                      const isPast = isPastDate(date, today);
                      const isToday = isSameDate(date, today);
                      const isDisabled = isPast && !isToday;
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={isDisabled}
                          className={[
                            "rv-schedule-date",
                            isSameDate(date, selectedDate) ? "selected" : "",
                            selectedRanges.some((range) => range.date === getDateKey(date)) ? "has-suggestion" : "",
                            isToday ? "today" : "",
                          ].join(" ")}
                          onClick={() => handleDateClick(date, isPast, isToday)}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rv-schedule-guide">
                    <strong>일정 가이드</strong>
                    <span>날짜를 고른 뒤 중앙 시간표에서 가능한 시간을 제안해 주세요.</span>
                  </div>
                </section>

                <section className="rv-schedule-card rv-schedule-week">
                  <div className="rv-schedule-week-head">
                    <div>
                      <div className="rv-schedule-eyebrow">STEP 03</div>
                      <h2>상담 가능 시간 제안</h2>
                    </div>
                    <span className="rv-timezone">GMT+9</span>
                  </div>
                  <div className="rv-schedule-grid-scroll">
                    <div className="rv-schedule-week-grid">
                      <span className="rv-schedule-grid-corner" />
                      {scheduleWeekDays.map((day) => (
                        <button
                          key={day.toISOString()}
                          type="button"
                          className={isSameDate(day, selectedDate) ? "selected-day" : ""}
                          onClick={() => handleDateClick(day, isPastDate(day, today), isSameDate(day, today))}
                        >
                          <small>{["일", "월", "화", "수", "목", "금", "토"][day.getDay()]}</small>
                          <strong>{day.getDate()}</strong>
                        </button>
                      ))}
                      {TIME_OPTIONS.map((time) => (
                        <div className="rv-schedule-grid-row" key={time}>
                          <span className="rv-schedule-grid-time">{time}</span>
                          {scheduleWeekDays.map((day) => {
                            const dateKey = getDateKey(day);
                            const blocked = getBlockedTimesForDate(day).has(time);
                            const selected = selectedRanges.some(
                              (range) => range.date === dateKey && range.startTime === time
                            );
                            const disabled = (isPastDate(day, today) && !isSameDate(day, today)) || blocked;
                            return (
                              <button
                                key={`${dateKey}-${time}`}
                                type="button"
                                disabled={disabled}
                                className={[
                                  "rv-schedule-slot",
                                  selected ? "selected" : "",
                                  blocked ? "blocked" : "",
                                ].join(" ")}
                                onClick={() => toggleTimeRange(time, day)}
                                aria-label={`${dateKey} ${time} ${selected ? "제안 일정 삭제" : "제안 일정 추가"}`}
                              >
                                {selected && <span>{time} - {addMinutesToTime(time, CONSULTATION_DURATION_MINUTES)}</span>}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="rv-schedule-card rv-schedule-summary" aria-live="polite">
                  <div className="rv-schedule-summary-head">
                    <div className="rv-schedule-eyebrow">SELECTED</div>
                    <h2>제안된 상담 일정</h2>
                  </div>
                  {selectedRanges.length === 0 ? (
                    <p className="rv-schedule-empty">날짜와 시간표에서 가능한 시간을 선택해 주세요.</p>
                  ) : (
                    <ul className="rv-schedule-range-list">
                      {selectedRanges.map((range) => {
                        const date = new Date(`${range.date}T00:00:00`);
                        return (
                          <li key={`${range.date}-${range.startTime}`}>
                            <strong>{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`}</strong>
                            <span>{range.startTime} - {range.endTime}</span>
                            <button
                              type="button"
                              onClick={() => removeTimeRange(range)}
                              aria-label={`${range.date} ${range.startTime} 제안 일정 삭제`}
                            >
                              ×
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button type="button" className="rv-schedule-next" onClick={handleNextStep}>
                    다음 단계로 이동 <span>→</span>
                  </button>
                </aside>

                <div className="rv-schedule-actions">
                  <button type="button" className="rv-step-prev" onClick={handlePrevStep}>이전 단계</button>
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

                <label className="rv-additional-request">
                  <span>추가 요청 사항</span>
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
              <div className="rv-summary-range-list">
                <span>제안 일정</span>
                {selectedRanges.length === 0 ? (
                  <strong>{t("common.notSelected")}</strong>
                ) : (
                  <ul>
                    {selectedRanges.map((range) => (
                      <li key={`${range.date}-${range.startTime}`}>
                        {range.date} {range.startTime} - {range.endTime}
                      </li>
                    ))}
                  </ul>
                )}
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
