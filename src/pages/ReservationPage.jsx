import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import "../App.css";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

export default function ReservationPage() {
  const today = useMemo(() => new Date(), []);

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedField, setSelectedField] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("예약 정보", {
      ...form,
      field: selectedField,
      selectedDate,
    });
    alert("예약 정보가 전송되었습니다.");
  };

  return (
    <div className="App">
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

                <div className="reservation-field-group">
                  <div className="reservation-field-title">상담 분야 선택</div>

                  <div className="reservation-field-buttons">
                    {["인사", "노무", "회계", "법무"].map((field) => (
                      <button
                        key={field}
                        type="button"
                        className={`field-button ${selectedField === field ? "active" : ""}`}
                        onClick={() => setSelectedField(field)}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reservation-selected-info">
                  <div>
                    선택한 상담 분야:{" "}
                    <strong>{selectedField || "선택 안 됨"}</strong>
                  </div>
                  <div>
                    선택한 날짜:{" "}
                    <strong>
                      {selectedDate.getFullYear()}년{" "}
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                    </strong>
                  </div>
                </div>

                <textarea
                  name="note"
                  placeholder="기타 요청사항"
                  className="reservation-textarea"
                  rows={5}
                  value={form.note}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                className="btn primary reservation-submit"
                onClick={handleSubmit}
              >
                전송하기
              </button>
            </section>

            <section className="reservation-right">
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
                  {viewDate.getMonth() + 1}월
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

                    return (
                      <div
                        key={date.toISOString()}
                        className={`calendar-day ${isSelected ? "selected" : ""} ${isPast ? "past" : ""}`}
                        onClick={() => {
                          if (!isPast || isToday) {
                            setSelectedDate(date);
                          }
                        }}
                      >
                        <div className="calendar-day-inner">
                          <span className="calendar-day-number">
                            {date.getDate()}
                          </span>

                          {isPast && !isToday && (
                            <span className="calendar-day-x">✕</span>
                          )}
                        </div>
                      </div>
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
