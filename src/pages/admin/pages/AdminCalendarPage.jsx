import { useMemo, useState } from "react";
import AdminCard from "../components/AdminCard";
import AdminModal from "../components/AdminModal";
import { mockApplications } from "../mockData";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

// sonny 브랜치에서 추가된 관리자 블락 일정 mock 데이터입니다.
// 변경 이유: 실제 관리자 블락 API 연결 전에도 ADMIN 캘린더에서 막힌 일정 표시 UI를 확인하기 위해 추가합니다.
const mockBlocks = [
  {
    id: 1,
    field: "accounting",
    blocked_date: "2026-06-12T15:00:00.000Z",
    blocked_time: "13:00:00",
    reason: "관리자 외부 일정",
  },
  {
    id: 2,
    field: null,
    blocked_date: "2026-07-14T15:00:00.000Z",
    blocked_time: "15:00:00",
    reason: "전체 상담 불가",
  },
  {
    id: 3,
    field: "software",
    blocked_date: "2026-07-28T15:00:00.000Z",
    blocked_time: "10:00:00",
    reason: "내부 회의 일정",
  },
];

function toDateKey(date) {
  if (typeof date === "string") return date.slice(0, 10);
  // 기존 ISO 기준 변환입니다.
  // return date.toISOString().slice(0, 10);

  // 변경 이유: toISOString은 브라우저 타임존에 따라 날짜가 하루 밀릴 수 있어
  // 달력 칸과 오늘/선택 날짜 표시가 어긋나지 않도록 로컬 날짜 기준으로 변환합니다.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getApplicationDateKey(item) {
  return toDateKey(item.selectedDate || item.date);
}

function getApplicationTime(item) {
  return item.selectedTime || item.time || "-";
}

function getApplicationTitle(item) {
  return item.CName || item.name || "회사명 없음";
}

function getApplicationSubtitle(item) {
  return `${item.field || item.type || "상담 분야 없음"} · ${getApplicationTime(item)}`;
}

function getTodayKey() {
  return toDateKey(new Date());
}

function getFieldLabel(field) {
  if (field === "law") return "법률";
  if (field === "accounting") return "회계";
  if (field === "software") return "소프트웨어";
  if (field === "insa") return "인사";
  if (field === "labor") return "노무";
  return "전체 분야";
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
  // 기존 고정 월/날짜입니다.
  // const [viewDate, setViewDate] = useState(new Date(2026, 3, 1));
  // const [selectedDate, setSelectedDate] = useState("2026-04-30");

  // 변경 이유: ADMIN에 들어왔을 때 항상 현재 월과 오늘 날짜를 먼저 확인할 수 있게 합니다.
  const todayKey = getTodayKey();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applicationsByDate = useMemo(() => {
    return mockApplications.reduce((acc, item) => {
      // 기존 date 필드 기준 분류입니다.
      // acc[item.date] = [...(acc[item.date] || []), item];

      // 변경 이유: 백엔드 예약 데이터가 selectedDate 필드로 들어올 예정이라 같은 기준으로 묶습니다.
      const dateKey = getApplicationDateKey(item);
      acc[dateKey] = [...(acc[dateKey] || []), item];
      return acc;
    }, {});
  }, []);

  const blocksByDate = useMemo(() => {
    return mockBlocks.reduce((acc, block) => {
      const dateKey = toDateKey(block.blocked_date);
      acc[dateKey] = [...(acc[dateKey] || []), block];
      return acc;
    }, {});
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const selectedItems = applicationsByDate[selectedDate] || [];
  const selectedBlocks = blocksByDate[selectedDate] || [];

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Applications</p>
          <h2>신청 기록 캘린더</h2>
          <span>상담 신청 내역과 막힌 일정을 날짜별로 확인합니다.</span>
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
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                setSelectedDate(todayKey);
              }}
            >
              오늘
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
              const dayBlocks = blocksByDate[key] || [];
              const isToday = key === todayKey;
              const hasItems = items.length > 0;
              const isPast = key < todayKey;
              const isBlocked = dayBlocks.length > 0;

              return (
                <button
                  type="button"
                  key={key}
                  className={[
                    "adm-day",
                    selectedDate === key ? "selected" : "",
                    isToday ? "today" : "",
                    hasItems ? "has-items" : "",
                    isPast ? "past" : "",
                    isBlocked ? "blocked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedDate(key)}
                >
                  <span>{date.getDate()}</span>
                  {hasItems && <b>{items.length}</b>}
                  {isBlocked && <em>BLOCK</em>}
                </button>
              );
            })}
          </div>

          <aside className="adm-side-panel">
            <div className="adm-side-panel-head">
              <h3>{selectedDate}</h3>
              <span>
                신청 {selectedItems.length}건 / 블락 {selectedBlocks.length}건
              </span>
            </div>

            {selectedBlocks.length > 0 && (
              <div className="adm-block-list">
                {selectedBlocks.map((block) => (
                  <div className="adm-block-item" key={block.id}>
                    <strong>
                      {getFieldLabel(block.field)} · {block.blocked_time.slice(0, 5)}
                    </strong>
                    <small>{block.reason}</small>
                  </div>
                ))}
              </div>
            )}

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
                    {/* 기존 표시 방식입니다. */}
                    {/* <strong>{item.name}</strong>
                    <span>
                      {item.type} · {item.time}
                    </span>
                    <small>{item.memo}</small> */}

                    {/* 변경 이유: 새 백엔드 예약 데이터 필드(CName, kind, field, selectedTime)를 그대로 보여주기 위함입니다. */}
                    <strong>{getApplicationTitle(item)}</strong>
                    <span>{getApplicationSubtitle(item)}</span>
                    <small>{item.kind || "직종 정보 없음"}</small>
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
            {/* 기존 상세 항목입니다. */}
            {/* <div>
              <dt>이름</dt>
              <dd>{selectedApplication.name}</dd>
            </div> */}
            <div>
              <dt>연락처</dt>
              <dd>{selectedApplication.phone}</dd>
            </div>
            <div>
              <dt>회사명</dt>
              <dd>{selectedApplication.CName || "-"}</dd>
            </div>
            <div>
              <dt>직종</dt>
              <dd>{selectedApplication.kind || "-"}</dd>
            </div>
            <div>
              <dt>상담 분야</dt>
              <dd>{selectedApplication.field || selectedApplication.type || "-"}</dd>
            </div>
            <div>
              <dt>예약일</dt>
              <dd>
                {getApplicationDateKey(selectedApplication)} {getApplicationTime(selectedApplication)}
              </dd>
            </div>
            {/* 기존 상세 항목입니다. */}
            {/* <div>
              <dt>상담 유형</dt>
              <dd>{selectedApplication.type}</dd>
            </div>
            <div>
              <dt>메모</dt>
              <dd>{selectedApplication.memo}</dd>
            </div> */}
          </dl>
        </AdminModal>
      )}
    </div>
  );
}
