import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import "../../App.css";
import Header from "../../components/Header";
import YearMonthPicker from "../../components/YearMonthPicker";
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

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} />

      <main className="reservation-page">
        <div className="container reservation-container">
          <div className="reservation-head">
            <div>
              <div className="kicker">Consult Reservation</div>
              <h1 className="section-title reservation-title">
                {t("reservation.title")}
              </h1>
            </div>

            <Link to="/" className="btn">
              {t("common.backHome")}
            </Link>
          </div>

          <div className="reservation-layout">
            <section className="reservation-left card">
              <h2 className="reservation-subtitle">
                {t("reservation.infoTitle")}
              </h2>

              <div className="reservation-form">
                <input
                  type="text"
                  name="name"
                  placeholder={t("reservation.name")}
                  className="reservation-input"
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="phone"
                  placeholder={t("reservation.phone")}
                  className="reservation-input"
                  value={form.phone}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder={t("reservation.email")}
                  className="reservation-input"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="CName"
                  placeholder={t("reservation.company")}
                  className="reservation-input"
                  value={form.CName}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="kind"
                  placeholder={t("reservation.job")}
                  className="reservation-input"
                  value={form.kind}
                  onChange={handleChange}
                />

                <div className="reservation-field-group">
                  <div className="reservation-field-title">
                    {t("reservation.fieldTitle")}
                  </div>

                  <div className="reservation-field-buttons">
                    {FIELD_OPTIONS.map((field) => (
                      <button
                        key={field.value}
                        type="button"
                        className={`field-button ${
                          selectedField === field.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setSelectedField(field.value);
                          setSelectedTime("");
                          setSubmitError("");
                          setSubmitSuccess("");
                        }}
                      >
                        {t(`reservation.${field.labelKey}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reservation-summary">
                  <div className="reservation-summary-title">
                    {t("reservation.summaryTitle")}
                  </div>

                  <div className="reservation-summary-item">
                    {t("reservation.field")}:{" "}
                    <strong>
                      {FIELD_OPTIONS.find((item) => item.value === selectedField)
                        ? t(
                            `reservation.${
                              FIELD_OPTIONS.find(
                                (item) => item.value === selectedField
                              ).labelKey
                            }`
                          )
                        : t("common.notSelected")}
                    </strong>
                  </div>

                  <div className="reservation-summary-item">
                    {t("reservation.date")}:{" "}
                    <strong>{formatTranslatedDate(language, selectedDate)}</strong>
                  </div>

                  <div className="reservation-summary-item">
                    {t("reservation.time")}:{" "}
                    <strong>{selectedTime || t("common.notSelected")}</strong>
                  </div>
                </div>

                <div className="reservation-selected-info">
                  <div>
                    {t("reservation.field")}:{" "}
                    <strong>
                      {FIELD_OPTIONS.find((item) => item.value === selectedField)
                        ? t(
                            `reservation.${
                              FIELD_OPTIONS.find(
                                (item) => item.value === selectedField
                              ).labelKey
                            }`
                          )
                        : t("common.notSelected")}
                    </strong>
                  </div>
                  <div>
                    {t("reservation.date")}:{" "}
                    <strong>{formatTranslatedDate(language, selectedDate)}</strong>
                  </div>
                  <div>
                    {t("reservation.time")}:{" "}
                    <strong>{selectedTime || t("common.notSelected")}</strong>
                  </div>
                </div>
              </div>

              {listError && <p className="login-error">{listError}</p>}
              {submitError && <p className="login-error">{submitError}</p>}
              {submitSuccess && (
                <p className="login-success">{submitSuccess}</p>
              )}

              <button
                type="button"
                className="btn primary reservation-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("common.sending") : t("common.send")}
              </button>
            </section>

            <section className="reservation-right">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
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
                  className="btn"
                  onClick={handleRefreshReservationList}
                  disabled={isRefreshingList}
                >
                  {isRefreshingList
                    ? t("reservation.refreshing")
                    : t("reservation.refresh")}
                </button>
              </div>

              <div className="reservation-calendar-nav">
                <button
                  type="button"
                  className="calendar-arrow"
                  onClick={handlePrevMonth}
                  aria-label={t("reservation.previousMonth")}
                >
                  ◀
                </button>

                <div className="calendar-month">
                  {formatTranslatedMonth(language, viewDate)}
                </div>

                <button
                  type="button"
                  className="calendar-arrow"
                  onClick={handleNextMonth}
                  aria-label={t("reservation.nextMonth")}
                >
                  ▶
                </button>
              </div>

              <div className="reservation-calendar card">
                <div className="calendar-board">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-weekday">
                      {t(`reservation.${day}`)}
                    </div>
                  ))}

                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="calendar-day empty"
                        />
                      );
                    }

                    const isSelected = isSameDate(date, selectedDate);
                    const isPast = isPastDate(date, today);
                    const isToday = isSameDate(date, today);
                    const isDisabled = isPast && !isToday;

                    return (
                      <div
                        key={date.toISOString()}
                        className={`calendar-day ${
                          isSelected ? "selected" : ""
                        } ${isDisabled ? "disabled past" : ""}`}
                        onClick={() => handleDateClick(date, isPast, isToday)}
                      >
                        <div className="calendar-day-inner">
                          <span className="calendar-day-number">
                            {date.getDate()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="reservation-time card">
                <div className="reservation-time-head">
                  {t("reservation.consultTime")}
                </div>

                <div className="reservation-time-grid">
                  {TIME_OPTIONS.map((time) => {
                  const blocked = blockedTimes.has(time);

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={blocked}
                      className={[
                        "time-button",
                        selectedTime === time ? "selected" : "",
                        blocked ? "blocked" : "",
                      ].join(" ")}
                      onClick={() => {
                        if (!blocked) {
                          setSelectedTime(time);
                        }
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
