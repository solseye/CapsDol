import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
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
import { getReservationUiCopy } from "../../i18n/reservationUi";
import { markWorkflowEvent } from "../../utils/workflowProgress";

const WEEK_DAYS = [
  "weekdaySun",
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
];

// 오전 9시부터 오후 6시까지 30분 단위로 상담 가능 시간을 제안합니다.
const TIME_OPTIONS = Array.from({ length: 19 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const FIELD_OPTIONS = [
  { labelKey: "fieldHr", value: "hr" },
  { labelKey: "fieldLabor", value: "labor" },
  { labelKey: "fieldAccounting", value: "accounting" },
  { labelKey: "fieldLaw", value: "law" },
];

const CONSULTATION_DURATION_MINUTES = 30;

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
  // API dates are calendar dates. Preserve their YYYY-MM-DD portion to avoid timezone shifts.
  if (typeof dateValue === "string") {
    const match = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

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

function isDateInLoadedRange(date, range) {
  if (!range) return false;

  const target = new Date(date);
  const start = new Date(range.start);
  const end = new Date(range.end);

  return target >= start && target <= end;
}


function addMinutesToTime(time, minutesToAdd) {
  const [hour, minute] = String(time).split(":").map(Number);

  const totalMinutes = hour * 60 + minute + minutesToAdd;

  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
}

function getTimeMinutes(timeValue) {
  const [hour, minute] = String(timeValue || "")
    .slice(0, 5)
    .split(":")
    .map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return hour * 60 + minute;
}

function normalizeSelectedRanges(ranges) {
  const sortedRanges = [...ranges].sort((a, b) =>
    `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
  );

  return sortedRanges.reduce((mergedRanges, range) => {
    const previousRange = mergedRanges[mergedRanges.length - 1];

    if (
      previousRange &&
      previousRange.date === range.date &&
      getTimeMinutes(range.startTime) <= getTimeMinutes(previousRange.endTime)
    ) {
      previousRange.endTime =
        getTimeMinutes(range.endTime) > getTimeMinutes(previousRange.endTime)
          ? range.endTime
          : previousRange.endTime;
      return mergedRanges;
    }

    mergedRanges.push({ ...range });
    return mergedRanges;
  }, []);
}

function isTimeSlotSelected(ranges, date, time) {
  const slotStart = getTimeMinutes(time);

  return ranges.some(
    (range) =>
      range.date === date &&
      slotStart >= getTimeMinutes(range.startTime) &&
      slotStart < getTimeMinutes(range.endTime)
  );
}

function addTimeSlotToRanges(ranges, date, time) {
  return normalizeSelectedRanges([
    ...ranges,
    {
      date,
      startTime: time,
      endTime: addMinutesToTime(time, CONSULTATION_DURATION_MINUTES),
    },
  ]);
}

function removeTimeSlotFromRanges(ranges, date, time) {
  const slotStart = getTimeMinutes(time);
  const slotEnd = slotStart + CONSULTATION_DURATION_MINUTES;

  return normalizeSelectedRanges(
    ranges.flatMap((range) => {
      const rangeStart = getTimeMinutes(range.startTime);
      const rangeEnd = getTimeMinutes(range.endTime);

      if (
        range.date !== date ||
        slotStart < rangeStart ||
        slotStart >= rangeEnd
      ) {
        return range;
      }

      const nextRanges = [];

      if (rangeStart < slotStart) {
        nextRanges.push({
          ...range,
          endTime: time,
        });
      }

      if (slotEnd < rangeEnd) {
        nextRanges.push({
          ...range,
          startTime: addMinutesToTime(time, CONSULTATION_DURATION_MINUTES),
        });
      }

      return nextRanges;
    })
  );
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
  const ui = getReservationUiCopy();

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
  const [consultType, setConsultType] = useState(ui.consultTypes[0].id);
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  // 여러 후보 시간을 함께 제안하기 위한 예약 범위 목록입니다.
  const [selectedRanges, setSelectedRanges] = useState([]);
  // 시간표에서 드래그하는 동안에는 모든 슬롯에 같은 선택/해제 동작을 적용합니다.
  const timeRangeDragRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    CName: "",
    kind: "",
  });

  const [blocks, setBlocks] = useState([]);
  const loadedRangeRef = useRef(null);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [listError, setListError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsSubmitted] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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

        const currentMonth = new Date(getMonthStartIso(viewDate));

        // 이미 불러온 범위 안이면 API 호출하지 않음
        if (isDateInLoadedRange(currentMonth, loadedRangeRef.current)) {
          return;
        }

        const baseDate = getMonthStartIso(viewDate);

        const data = await getReservationListByRange({
          baseDate,
          previousMonthCount: 2,
          nextMonthCount: 4,
        });

        setBlocks(data.blocks || []);

        const base = new Date(baseDate);

        const start = new Date(base);
        start.setMonth(start.getMonth() - 2);
        start.setDate(1);

        const end = new Date(base);
        end.setMonth(end.getMonth() + 5);
        end.setDate(0);

        loadedRangeRef.current = {
          start: start.toISOString().slice(0, 10),
          end: end.toISOString().slice(0, 10),
        };
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
      // The current API returns blocked_date/blocked_time. Keep legacy keys as a fallback.
      const blockDate = getDateKey(
        block.blocked_date || block.unavailable_date || block.selected_date || block.date
      );
      if (blockDate !== dateKey) return;

      if (
        block.field &&
        block.field !== selectedField &&
        API_FIELD_VALUES[selectedField] !== block.field
      )
        return;

      const start = getTimeMinutes(
        block.blocked_time || block.start_time || block.selected_time
      );
      if (start === null) return;

      const end = getTimeMinutes(block.end_time) ?? start + CONSULTATION_DURATION_MINUTES;

      TIME_OPTIONS.forEach((time) => {
        const slotStart = getTimeMinutes(time);
        const slotEnd = slotStart + CONSULTATION_DURATION_MINUTES;
        const overlap = !(slotEnd <= start || slotStart >= end);

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
        setSubmitError(ui.nameRequired);
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
      return false;
      }

      if (!form.email.trim()) {
        setSubmitError(ui.emailRequired);
        return;
      }
    }

    if (currentStep === 2 && (!consultType || !selectedExpertId)) {
      setSubmitError(
        !consultType
          ? ui.typeRequired
          : ui.expertRequired
      );
      return;
    }

    if (currentStep === 3 && selectedRanges.length === 0) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleDateClick = (date) => {
    if (!date || isPastDate(date, today)) {
      setSubmitError(ui.pastDate);
      return;
    }

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
      return false;
    }

      if (!form.kind.trim()) {
        setSubmitError(t("reservation.kindError"));
      return false;
    }

      if (!selectedField) {
        setSubmitError(t("reservation.fieldError"));
      return false;
    }

    if (selectedRanges.length === 0) {
      setSubmitError(t("reservation.timeError"));
      return false;
    }

    if (selectedRanges.some((range) => isPastDate(new Date(`${range.date}T00:00:00`), today))) {
      setSubmitError(ui.pastBooking);
      return false;
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
        markWorkflowEvent("reservationSubmittedAt", new Date().toISOString());
        setSubmitSuccess(t("reservation.submitSuccess"));
        setIsSubmitted(true);

        const listData = await getReservationListByRange({
          baseDate: getMonthStartIso(viewDate),
          previousMonthCount: 2,
          nextMonthCount: 4,
        });

        setBlocks(listData.blocks || []);
        return true;
      } else {
        markWorkflowEvent("reservationSubmittedAt", new Date().toISOString());
        setSubmitSuccess(t("reservation.submitFallbackSuccess"));
        setIsSubmitted(true);
        return true;
      }
    } catch (err) {
      setSubmitError(err.message || t("reservation.submitError"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmitConfirmation = () => {
    setSubmitError("");

    if (selectedRanges.length === 0) {
      setSubmitError(t("reservation.timeError"));
      return;
    }

    if (selectedRanges.some((range) => isPastDate(new Date(`${range.date}T00:00:00`), today))) {
      setSubmitError(ui.pastBooking);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const updateTimeRangeSelection = (time, dateValue = selectedDate, shouldSelect) => {
    if (!dateValue) {
      setSubmitError(ui.chooseDateError);
      return;
    }

    if (isPastDate(dateValue, today)) {
      setSubmitError(ui.pastDate);
      return;
    }

    if (getBlockedTimesForDate(dateValue).has(time)) return;

    const date = getDateKey(dateValue);
    setSelectedDate(new Date(dateValue));

    setSelectedRanges((prev) => {
      const exists = isTimeSlotSelected(prev, date, time);

      if (shouldSelect === false || (shouldSelect === undefined && exists)) {
        return removeTimeSlotFromRanges(prev, date, time);
      }

      if (exists) return prev;

      return addTimeSlotToRanges(prev, date, time);
    });
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitted(false);
  };

  const handleTimeSlotPointerDown = (event, time, day, isSelected) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const shouldSelect = !isSelected;
    timeRangeDragRef.current = { shouldSelect };
    event.preventDefault();
    updateTimeRangeSelection(time, day, shouldSelect);
  };

  const handleTimeSlotPointerEnter = (event, time, day) => {
    const dragState = timeRangeDragRef.current;
    if (!dragState || event.buttons === 0) return;

    updateTimeRangeSelection(time, day, dragState.shouldSelect);
  };

  const handleTimeSlotKeyDown = (event, time, day, isSelected) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    updateTimeRangeSelection(time, day, !isSelected);
  };

  useEffect(() => {
    const stopTimeRangeDrag = () => {
      timeRangeDragRef.current = null;
    };

    window.addEventListener("pointerup", stopTimeRangeDrag);
    window.addEventListener("pointercancel", stopTimeRangeDrag);

    return () => {
      window.removeEventListener("pointerup", stopTimeRangeDrag);
      window.removeEventListener("pointercancel", stopTimeRangeDrag);
    };
  }, []);

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

  const expertProfiles = ui.experts;

  const selectedExpert =
    expertProfiles.find((expert) => expert.id === selectedExpertId) || null;

  const selectedConsultType =
    ui.consultTypes.find((type) => type.id === consultType) || ui.consultTypes[0];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <div className="rv-page">
        <aside className="rv-sidebar">
        <Link to="/" className="rv-logo">
          <span>◎</span>
          <strong>{ui.brand}</strong>
          <small>{ui.os}</small>
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
          <span>{ui.os}</span>
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
              <input type="text" placeholder={ui.search} />
            </div>
            <Link to="/myreservations" className="rv-top-link">
              {ui.myBookings}
            </Link>
            <span className="rv-user-dot">M</span>
          </div>
        </header>

        <main className="rv-main">
          <section className="rv-content">
            <div className="rv-hero">
              <div>
                <p className="rv-hero-eyebrow">{ui.eyebrow}</p>
                <h1>{ui.title}</h1>
                <p>{ui.intro}</p>
              </div>
            </div>

            <div className="rv-stepper" aria-label={ui.progress}>
              {ui.steps.map((step, index) => (
                <div className="rv-step" key={step}>
                  <span className={currentStep >= index + 1 ? "active" : ""}>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>

            <section className="rv-approval-flow" aria-label={ui.flowLabel}>
              {ui.flow.map(([title, description], index) => (
                <div key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              ))}
            </section>

            {currentStep === 1 && (
              <section className="rv-panel rv-basic-panel rv-step-screen">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 01</span>
                    <h2>{ui.consultInfo}</h2>
                  </div>
                </div>

                <div className="rv-basic-stage rv-basic-stage-top">
                  <div className="rv-section-head">
                    <span>01</span>
                    <h2>{ui.consultType}</h2>
                  </div>

                  <div className="rv-consult-type-grid">
                    {ui.consultTypes.map((type) => (
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
                  <strong>
                    <span>02</span>
                    {ui.applicant}
                  </strong>
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
                    {ui.next}
                    <span>→</span>
                  </button>
                </div>
              </section>
            )}

            {currentStep === 2 && (
            <section className="rv-expert-section rv-step-screen">
              <div className="rv-section-head">
                <span>Step 02</span>
                <h2>{ui.expertSelect}</h2>
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
                      {ui.approvalReview}
                      <small> {ui.average} {expert.rating}</small>
                    </span>
                  </button>
                ))}
              </div>

              <div className="rv-step-actions">
                <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                  {ui.previous}
                </button>
                <button type="button" className="rv-step-next" onClick={handleNextStep}>
                  {ui.next}
                  <span>→</span>
                </button>
              </div>
            </section>
            )}

            {currentStep === 3 && (
              <>
                <section className="rv-schedule-intro">
                  <span>STEP 03</span>
                  <h2>{ui.scheduleTitle}</h2>
                  <p>{ui.scheduleIntro}</p>
                </section>

                <div className="rv-schedule-layout">
                <section className="rv-schedule-card rv-schedule-month">
                  <div className="rv-schedule-month-title">
                    <strong>{formatTranslatedMonth(language, viewDate)}</strong>
                    <span>{ui.chooseDate}</span>
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
                          onClick={() => handleDateClick(date)}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rv-schedule-month-actions">
                    <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                      {ui.previous}
                    </button>
                  </div>
                </section>

                <section className="rv-schedule-card rv-schedule-week">
                  <div className="rv-schedule-week-head">
                      <div>
                        <div className="rv-schedule-eyebrow">STEP 03</div>
                        <h2>{ui.proposeTime}</h2>
                        <p className="rv-schedule-recommendation">
                          {ui.durationGuide}
                        </p>
                        <p className="rv-schedule-drag-guide">
                          {ui.dragGuide}
                        </p>
                    </div>
                    <span className="rv-timezone">GMT+9</span>
                  </div>
                  <div className="rv-schedule-grid-scroll">
                    <div className="rv-schedule-week-grid">
                      <span className="rv-schedule-grid-corner" />
                      {scheduleWeekDays.map((day) => {
                        const isPast = isPastDate(day, today);

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isPast}
                            className={isSameDate(day, selectedDate) ? "selected-day" : ""}
                            onClick={() => handleDateClick(day)}
                          >
                            <small>{t(`reservation.${WEEK_DAYS[day.getDay()]}`)}</small>
                            <strong>{day.getDate()}</strong>
                          </button>
                        );
                      })}
                      {TIME_OPTIONS.map((time) => (
                        <div className="rv-schedule-grid-row" key={time}>
                          <span className="rv-schedule-grid-time">{time}</span>
                          {scheduleWeekDays.map((day) => {
                            const dateKey = getDateKey(day);
                            const blocked = getBlockedTimesForDate(day).has(time);
                            const selected = isTimeSlotSelected(selectedRanges, dateKey, time);
                            const rangeStart = selectedRanges.find(
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
                                onPointerDown={(event) => handleTimeSlotPointerDown(event, time, day, selected)}
                                onPointerEnter={(event) => handleTimeSlotPointerEnter(event, time, day)}
                                onKeyDown={(event) => handleTimeSlotKeyDown(event, time, day, selected)}
                                aria-label={`${dateKey} ${time} ${selected ? ui.removeSlot : ui.addSlot}`}
                                aria-pressed={selected}
                              >
                                {blocked ? (
                                  <span className="rv-schedule-blocked-label">{ui.blocked}</span>
                                ) : (
                                  rangeStart && <span>{rangeStart.startTime} - {rangeStart.endTime}</span>
                                )}
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
                    <h2>{ui.proposed}</h2>
                  </div>
                  {selectedRanges.length === 0 ? (
                    <p className="rv-schedule-empty">{ui.emptySchedule}</p>
                  ) : (
                    <ul className="rv-schedule-range-list">
                      {selectedRanges.map((range) => {
                        const date = new Date(`${range.date}T00:00:00`);
                        return (
                          <li key={`${range.date}-${range.startTime}`}>
                            <strong>
                              {new Intl.DateTimeFormat(
                                language === "en"
                                  ? "en-US"
                                  : language === "ja"
                                    ? "ja-JP"
                                    : "ko-KR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  weekday: "short",
                                }
                              ).format(date)}
                            </strong>
                            <span>{range.startTime} - {range.endTime}</span>
                            <button
                              type="button"
                              onClick={() => removeTimeRange(range)}
                              aria-label={`${range.date} ${range.startTime} ${ui.removeSlot}`}
                            >
                              ×
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button type="button" className="rv-schedule-next" onClick={handleNextStep}>
                    {ui.moveNext} <span>→</span>
                  </button>
                </aside>

                </div>
              </>
            )}

            {currentStep === 4 && (
              <section className="rv-panel rv-review-panel rv-step-screen">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 04</span>
                    <h2>{ui.reviewTitle}</h2>
                  </div>
                </div>

                <label className="rv-additional-request">
                  <span>{ui.additional}</span>
                  <textarea
                    value={additionalRequest}
                    onChange={(e) => {
                      setAdditionalRequest(e.target.value);
                      setSubmitError("");
                      setSubmitSuccess("");
                      setIsSubmitted(false);
                    }}
                    rows="4"
                    placeholder={ui.additionalPlaceholder}
                  />
                </label>

                <div className="rv-step-actions">
                  <button type="button" className="rv-step-prev" onClick={handlePrevStep}>
                    {ui.previous}
                  </button>
                  <button
                    type="button"
                    className="rv-step-next"
                    onClick={openSubmitConfirmation}
                  >
                    {ui.reviewCta}
                    <span>→</span>
                  </button>
                </div>
              </section>
            )}
          </section>
          </main>
        </div>
      </div>

      {(listError || submitError || submitSuccess) && (
        <div className="rv-feedback" aria-live="polite">
          {listError && <p className="rv-error">{listError}</p>}
          {submitError && <p className="rv-error">{submitError}</p>}
          {submitSuccess && <p className="rv-success">{submitSuccess}</p>}
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="rv-confirm-backdrop" role="presentation" onMouseDown={() => !isSubmitting && setIsConfirmModalOpen(false)}>
          <section
            className="rv-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="rv-confirm-modal-head">
              <div>
                <span>{ui.modalLabel}</span>
                <h2 id="reservation-confirm-title">{ui.modalTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                aria-label={ui.closeModal}
              >
                ×
              </button>
            </div>
            <dl className="rv-confirm-list">
              <div><dt>{ui.field}</dt><dd>{selectedFieldLabel}</dd></div>
              <div><dt>{ui.type}</dt><dd>{selectedConsultType.title}</dd></div>
              <div><dt>{ui.expert}</dt><dd>{selectedExpert?.name || "-"}</dd></div>
              <div><dt>{ui.applicantName}</dt><dd>{form.name || "-"}</dd></div>
              <div className="rv-confirm-ranges"><dt>{ui.proposedSchedule}</dt><dd>{selectedRanges.map((range) => `${range.date} ${range.startTime}-${range.endTime}`).join(", ")}</dd></div>
              <div className="rv-confirm-note"><dt>{ui.additional}</dt><dd>{additionalRequest.trim() || ui.none}</dd></div>
            </dl>
            <p>{ui.modalNotice}</p>
            <div className="rv-confirm-actions">
              <button type="button" className="rv-step-prev" onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting}>{ui.edit}</button>
              <button
                type="button"
                className="rv-step-next"
                onClick={async () => {
                  const isSuccess = await handleSubmit();
                  if (isSuccess) setIsConfirmModalOpen(false);
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common.sending") : t("common.send")}
                <span>→</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
