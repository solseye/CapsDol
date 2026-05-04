import { useMemo, useState } from "react";
import AdminCard from "../components/AdminCard";
import AdminModal from "../components/AdminModal";
import { mockApplications } from "../mockData";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date) {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function AdminCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState("2026-04-30");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applicationsByDate = useMemo(() => {
    return mockApplications.reduce((acc, item) => {
      acc[item.date] = [...(acc[item.date] || []), item];
      return acc;
    }, {});
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const selectedItems = applicationsByDate[selectedDate] || [];

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Applications</p>
          <h2>신청 기록 캘린더</h2>
          <span>상담 신청 내역을 날짜별로 확인합니다.</span>
        </div>
      </div>

      <AdminCard
        title="월간 신청 기록"
        action={
          <div className="adm-calendar-nav">
            <button
              type="button"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
            >
              이전
            </button>
            <strong>
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </strong>
            <button
              type="button"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
            >
              다음
            </button>
          </div>
        }
      >
        <div className="adm-calendar-layout">
          <div className="adm-calendar">
            {weekDays.map((day) => (
              <div key={day} className="adm-weekday">
                {day}
              </div>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="adm-day empty" />;
              }

              const key = toDateKey(date);
              const items = applicationsByDate[key] || [];

              return (
                <button
                  type="button"
                  key={key}
                  className={`adm-day ${selectedDate === key ? "selected" : ""}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <span>{date.getDate()}</span>
                  {items.length > 0 && <b>{items.length}</b>}
                </button>
              );
            })}
          </div>

          <aside className="adm-side-panel">
            <div className="adm-side-panel-head">
              <h3>{selectedDate}</h3>
              <span>{selectedItems.length}건</span>
            </div>

            {selectedItems.length === 0 ? (
              <div className="adm-empty">선택한 날짜의 신청 기록이 없습니다.</div>
            ) : (
              <div className="adm-application-list">
                {selectedItems.map((item) => (
                  <button
                    type="button"
                    className="adm-application-item"
                    key={item.id}
                    onClick={() => setSelectedApplication(item)}
                  >
                    <strong>{item.name}</strong>
                    <span>
                      {item.type} · {item.time}
                    </span>
                    <small>{item.memo}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </AdminCard>

      {selectedApplication && (
        <AdminModal title="신청 상세 정보" onClose={() => setSelectedApplication(null)}>
          <dl className="adm-detail-list">
            <div>
              <dt>이름</dt>
              <dd>{selectedApplication.name}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{selectedApplication.phone}</dd>
            </div>
            <div>
              <dt>신청일</dt>
              <dd>
                {selectedApplication.date} {selectedApplication.time}
              </dd>
            </div>
            <div>
              <dt>상담 유형</dt>
              <dd>{selectedApplication.type}</dd>
            </div>
            <div>
              <dt>메모</dt>
              <dd>{selectedApplication.memo}</dd>
            </div>
          </dl>
        </AdminModal>
      )}
    </div>
  );
}
