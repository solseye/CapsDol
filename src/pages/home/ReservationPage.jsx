import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import "../../App.css";
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

const MONTHS_TO_FETCH = 7;

function isSameDate(a, b) {
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

  const [selectedField, setSelectedField] = useState("hr");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );

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

  const moveToMonth = (date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    setViewDate(nextMonth);
    setRequestYear(nextMonth.getFullYear());
    setRequestMonth(nextMonth.getMonth() + 1);
    setSelectedDate(nextMonth);
    setSelectedTime("");
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
      setSelectedDate(nextMonth);
      setSelectedTime("");

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
  };

  const handleDateClick = (date, isPast, isToday) => {
    if (isPast && !isToday) return;

    setSelectedDate(date);
    setSelectedTime("");
    setSubmitError("");
    setSubmitSuccess("");
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

    if (!selectedTime) {
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

        const listData = await getReservationListByRange(
          getMonthStartIso(viewDate),
          MONTHS_TO_FETCH
        );

        setSchedules(listData.schedules || []);
        setBlocks(listData.blocks || []);
      } else {
        setSubmitSuccess(t("reservation.submitFallbackSuccess"));
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
    return <Navigate to="/admin" replace />;
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
      name: "카네무라 미츠아키",
      title: "사법서사 · 행정서사",
      description:
        "회사 설립, 비자 취득, 정관 및 등기 절차처럼 법무 판단이 필요한 상담을 담당합니다.",
      tags: ["회사 설립", "비자", "등기"],
      rating: "4.9",
      reviews: "124",
      avatar: "G",
    },
    {
      field: "labor",
      name: "노무 · 사회보험 담당 전문가",
      title: "일본 노무 실무 컨설턴트",
      description:
        "일본 현지 채용, 사회보험, 급여 체계, 근로계약 관련 실무 리스크를 점검합니다.",
      tags: ["노무", "사회보험", "채용"],
      rating: "4.8",
      reviews: "57",
      avatar: "L",
    },
    {
      field: "hr",
      name: "시장 진출 전략 담당자",
      title: "일본 진출 준비 컨설턴트",
      description:
        "초기 진출 방향, 필요한 문서, 전문가 상담 순서를 정리해야 하는 기업을 안내합니다.",
      tags: ["전략", "준비", "운영"],
      rating: "4.8",
      reviews: "63",
      avatar: "H",
    },
  ];

  const selectedExpert =
    expertProfiles.find((expert) => expert.field === selectedField) ||
    expertProfiles[0];

  return (
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
                <h1>상담 가능 시간대를 확인하고 승인 요청하세요</h1>
                <p>
                  원하는 상담 분야와 가능한 시간대를 선택하면 예약 신청이
                  접수됩니다. 담당 전문가는 신청 내용을 확인한 뒤 승인 또는
                  거절 상태를 안내합니다.
                </p>
              </div>
            </div>

            <div className="rv-stepper">
              <span className="active">1</span>
              <strong>분야 선택</strong>
              <i />
              <span className={selectedDate ? "active" : ""}>2</span>
              <strong>가능 시간 확인</strong>
              <i />
              <span className={selectedTime ? "active" : ""}>3</span>
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

            <section className="rv-expert-section">
              <div className="rv-section-head">
                <span>Step 01</span>
                <h2>상담 분야와 담당 전문가</h2>
                <p>
                  먼저 상담 분야를 선택하면, 해당 분야 기준으로 예약 가능한
                  시간대를 확인할 수 있습니다.
                </p>
              </div>

              <div className="rv-expert-list">
                {expertProfiles.map((expert) => (
                  <button
                    type="button"
                    key={expert.field}
                    className={[
                      "rv-expert-card",
                      selectedField === expert.field ? "selected" : "",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedField(expert.field);
                      setSelectedTime("");
                      setSubmitError("");
                      setSubmitSuccess("");
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
            </section>

            <div className="rv-workspace">
              <section className="rv-panel rv-calendar-panel">
                <div className="rv-panel-head">
                  <div>
                    <span>Step 02</span>
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
                  {TIME_OPTIONS.map((time) => {
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
            </div>
          </section>

          <aside className="rv-summary-panel">
            <div className="rv-summary-head">
              <h2>예약 요약</h2>
              <div className="rv-summary-expert">
                <span className="rv-expert-avatar">{selectedExpert.avatar}</span>
                <div>
                  <strong>{selectedExpert.name}</strong>
                  <small>{selectedExpert.title}</small>
                </div>
              </div>
            </div>

            <div className="rv-selected-summary">
              <div>
                <span>상담 분야</span>
                <strong>{selectedFieldLabel}</strong>
              </div>
              <div>
                <span>예약 상태</span>
                <strong>승인 대기 신청</strong>
              </div>
              <div>
                <span>{t("reservation.date")}</span>
                <strong>{formatTranslatedDate(language, selectedDate)}</strong>
              </div>
              <div>
                <span>{t("reservation.time")}</span>
                <strong>{selectedTime || t("common.notSelected")}</strong>
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

            <div className="rv-form">
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
            </div>

            {listError && <p className="rv-error">{listError}</p>}
            {submitError && <p className="rv-error">{submitError}</p>}
            {submitSuccess && <p className="rv-success">{submitSuccess}</p>}

            <button
              type="button"
              className="rv-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("common.sending") : "전문가 승인 요청하기"}{" "}
              <span>→</span>
            </button>

            <div className="rv-advisory">
              <strong>승인 방식 안내</strong>
              <p>
                신청한 시간은 전문가가 승인해야 최종 확정됩니다. 상담 전
                히어링 시트를 작성하면 승인 검토와 상담 준비가 더 빨라집니다.
              </p>
              <Link to="/hearing-sheet">히어링 시트 작성</Link>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
