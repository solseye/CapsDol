import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import "../../App.css";
import Header from "../../components/Header";
import YearMonthPicker from "../../components/YearMonthPicker";
import {
  createReservation,
  getReservationListByRange,
} from "../../api/reservationApi";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
  { label: "인사", value: "hr" },
  { label: "노무", value: "labor" },
  { label: "회계", value: "accounting" },
  { label: "법무", value: "law" },
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
  return date.toISOString().slice(0, 10);
}

function getTimeKey(timeValue) {
  return String(timeValue || "").slice(0, 5);
}

function getMonthStartIso(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function addTwoHourBlock(blockedSet, time) {
  const index = TIME_OPTIONS.indexOf(time);
  if (index === -1) return;

  blockedSet.add(TIME_OPTIONS[index]);

  if (TIME_OPTIONS[index + 1]) {
    blockedSet.add(TIME_OPTIONS[index + 1]);
  }
}

export default function ReservationPage() {
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

  const [selectedField, setSelectedField] = useState("");
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
        setListError(err.message || "예약 일정을 불러오지 못했습니다.");
      }
    };

    if (isLoggedIn === true && !isAdmin) {
      fetchReservationList();
    }
  }, [isLoggedIn, isAdmin, viewDate]);

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

      const isActiveReservation =
        item.myReservationStatus !== "cancelled" &&
        item.myReservationStatus !== "rejected";

      if (
        itemDateKey === selectedDateKey &&
        item.field === selectedField &&
        isActiveReservation
      ) {
        addTwoHourBlock(blocked, itemTime);
      }

      if (
        itemDateKey === selectedDateKey &&
        item.field === selectedField &&
        item.block
      ) {
        addTwoHourBlock(blocked, itemTime);
      }
    });

    blocks.forEach((item) => {
      const itemDateKey = getDateKey(item.blocked_date);
      const itemTime = getTimeKey(item.blocked_time);

      if (itemDateKey === selectedDateKey && item.field === selectedField) {
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
      setListError("조회 기준 월을 선택해 주세요.");
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
      setListError(err.message || "예약 일정 조회에 실패했습니다.");
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

  const isBlockedTime = (time) => {
  if (!selectedDate || !selectedField) return false;

    return blocks.some((block) => {
      const blockDate = new Date(block.blocked_date)
        .toISOString()
        .slice(0, 10);

      const selectedDateKey = new Date(selectedDate)
        .toISOString()
        .slice(0, 10);

      const blockTime = String(block.blocked_time).slice(0, 5);

      const sameDate = blockDate === selectedDateKey;
      const sameTime = blockTime === time;

      const sameField =
        block.field === null ||
        block.field === selectedField;

      return sameDate && sameTime && sameField;
    });
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!form.phone.trim()) {
      setSubmitError("전화번호를 입력해 주세요.");
      return;
    }

    if (!form.CName.trim()) {
      setSubmitError("회사 이름을 입력해 주세요.");
      return;
    }

    if (!form.kind.trim()) {
      setSubmitError("상담 종류를 입력해 주세요.");
      return;
    }

    if (!selectedField) {
      setSubmitError("상담 분야를 선택해 주세요.");
      return;
    }

    if (!selectedTime) {
      setSubmitError("상담 시간을 선택해 주세요.");
      return;
    }

    if (blockedTimes.has(selectedTime)) {
      setSubmitError("이미 예약되었거나 예약이 불가능한 시간입니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await createReservation({
        phone: form.phone.trim(),
        CName: form.CName.trim(),
        kind: form.kind.trim(),
        field: selectedField,
        selectedDate: selectedDate.toISOString(),
        selectedTime,
      });

      if (data.success) {
        setSubmitSuccess("상담 예약 신청이 완료되었습니다. 승인 대기 상태입니다.");

        const listData = await getReservationListByRange(
          getMonthStartIso(viewDate),
          MONTHS_TO_FETCH
        );

        setSchedules(listData.schedules || []);
        setBlocks(listData.blocks || []);
      } else {
        setSubmitSuccess("상담 예약 신청이 완료되었습니다.");
      }
    } catch (err) {
      setSubmitError(err.message || "상담 예약에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn === null) {
    return <div>로딩 중...</div>;
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
                상담 예약 페이지
              </h1>
            </div>

            <Link to="/" className="btn">
              메인으로 돌아가기
            </Link>
          </div>

          <div className="reservation-layout">
            <section className="reservation-left card">
              <h2 className="reservation-subtitle">
                상담 예약에 필요한 기본 정보
              </h2>

              <div className="reservation-form">
                <input
                  type="text"
                  name="name"
                  placeholder="이름"
                  className="reservation-input"
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="전화번호"
                  className="reservation-input"
                  value={form.phone}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className="reservation-input"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="CName"
                  placeholder="회사 이름"
                  className="reservation-input"
                  value={form.CName}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="kind"
                  placeholder="직종"
                  className="reservation-input"
                  value={form.kind}
                  onChange={handleChange}
                />

                <div className="reservation-field-group">
                  <div className="reservation-field-title">상담 분야 선택</div>

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
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reservation-summary">
                  <div className="reservation-summary-title">선택 내용</div>

                  <div className="reservation-summary-item">
                    상담 분야:{" "}
                    <strong>
                      {FIELD_OPTIONS.find((item) => item.value === selectedField)
                        ?.label || "선택 안 됨"}
                    </strong>
                  </div>

                  <div className="reservation-summary-item">
                    날짜:{" "}
                    <strong>
                      {selectedDate.getFullYear()}년{" "}
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                    </strong>
                  </div>

                  <div className="reservation-summary-item">
                    시간: <strong>{selectedTime || "선택 안 됨"}</strong>
                  </div>
                </div>

                <div className="reservation-selected-info">
                  <div>
                    선택한 상담 분야:{" "}
                    <strong>
                      {FIELD_OPTIONS.find((item) => item.value === selectedField)
                        ?.label || "선택 안 됨"}
                    </strong>
                  </div>
                  <div>
                    선택한 날짜:{" "}
                    <strong>
                      {selectedDate.getFullYear()}년{" "}
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                    </strong>
                  </div>
                  <div>
                    선택한 시간: <strong>{selectedTime || "선택 안 됨"}</strong>
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
                {isSubmitting ? "전송 중..." : "전송하기"}
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
                  {isRefreshingList ? "조회 중..." : "일정 조회"}
                </button>
              </div>

              <div className="reservation-calendar-nav">
                <button
                  type="button"
                  className="calendar-arrow"
                  onClick={handlePrevMonth}
                  aria-label="이전 달"
                >
                  ◀
                </button>

                <div className="calendar-month">
                  {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
                </div>

                <button
                  type="button"
                  className="calendar-arrow"
                  onClick={handleNextMonth}
                  aria-label="다음 달"
                >
                  ▶
                </button>
              </div>

              <div className="reservation-calendar card">
                <div className="calendar-board">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-weekday">
                      {day}
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
                <div className="reservation-time-head">상담 시간</div>

                <div className="reservation-time-grid">
                  {TIME_OPTIONS.map((time) => {
                  const blocked = isBlockedTime(time);

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