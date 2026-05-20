import { useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "../admin/admin.css";

const dummyReservations = [
  {
    id: 1,
    company: "Test One Company",
    phone: "010-1111-1111",
    kind: "소프트웨어",
    field: "법률",
    date: "2026-06-03",
    time: "10:00",
    status: "승인 대기",
  },
  {
    id: 2,
    company: "Green Labs",
    phone: "010-2222-2222",
    kind: "경영 상담",
    field: "회계",
    date: "2026-06-18",
    time: "13:00",
    status: "승인 완료",
  },
];

const allAvailableSchedules = [
  {
    id: 1,
    date: "2026-06-03",
    time: "10:00",
    field: "법률",
    blocked: false,
  },
  {
    id: 2,
    date: "2026-06-12",
    time: "13:00",
    field: "회계",
    blocked: true,
  },
  {
    id: 3,
    date: "2026-07-07",
    time: "15:00",
    field: "소프트웨어",
    blocked: false,
  },
  {
    id: 4,
    date: "2026-07-21",
    time: "10:00",
    field: "법률",
    blocked: false,
  },
];

export default function MyReservations() {
  const [reservations, setReservations] = useState(dummyReservations);

  const [rangeStart, setRangeStart] = useState("2026-06-01");
  const [rangeEnd, setRangeEnd] = useState("2026-07-31");
  const [availableSchedules, setAvailableSchedules] = useState(
    allAvailableSchedules,
  );

  const handleCancel = (id) => {
    const ok = window.confirm("상담 예약을 취소하시겠습니까?");
    if (!ok) return;

    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "취소 완료" } : item,
      ),
    );
  };

  const handleRefreshSchedules = () => {
    const filteredSchedules = allAvailableSchedules.filter((item) => {
      return item.date >= rangeStart && item.date <= rangeEnd;
    });

    setAvailableSchedules(filteredSchedules);
  };

  return (
    <main className="reserve-page">
      <section className="reserve-hero">
        <p className="adm-eyebrow">My Reservations</p>
        <h2>내 상담 내역</h2>
        <span>내가 신청한 상담 예약의 상태와 일정을 확인할 수 있습니다.</span>
      </section>

      {/* 첫 번째: 예약 정보 카드 */}
      <section className="adm-card reserve-history-card">
        <div className="adm-card-head">
          <div>
            <h2>예약 정보</h2>
            <p>승인 대기, 승인 완료, 취소 완료 상태를 확인할 수 있습니다.</p>
          </div>

          <Link to="/" className="adm-btn ghost">
            홈으로
          </Link>
        </div>

        <div className="reserve-list">
          {reservations.map((item) => (
            <article className="reserve-item" key={item.id}>
              <div>
                <strong>
                  {item.field} · {item.time}
                </strong>

                <span>
                  {item.date} · {item.company}
                </span>

                <small>
                  {item.kind} / {item.status}
                </small>
              </div>

              <button
                type="button"
                className="adm-btn ghost"
                onClick={() => handleCancel(item.id)}
                disabled={item.status === "취소 완료"}
              >
                상담 취소
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 💡 두 번째: 예약 가능 일정 조회 카드 (클래스 추가로 마진 여백 대폭 분리) */}
      <section className="adm-card reserve-history-card reserve-query-section">
        <div className="adm-card-head">
          <div>
            <h2>예약 가능 일정 조회</h2>
            <p>원하는 기간을 선택해 상담 가능 일정과 막힌 일정을 확인합니다.</p>
          </div>
        </div>

        {/* 💡 구조 변경: 시작일, 종료일, 새로고침 버튼을 하나의 가로 묶음(Row)으로 결합 */}
        <div className="reserve-range-form-custom">
          <div className="range-inputs-group">
            <label>
              조회 시작일
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
            </label>

            <label>
              조회 종료일
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </label>

            {/* 💡 새로고침 버튼을 종료일 바로 오른쪽으로 이동 */}
            <button
              type="button"
              className="adm-btn primary reserve-refresh-btn-custom"
              onClick={handleRefreshSchedules}
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="reserve-list">
          {availableSchedules.length === 0 ? (
            <div className="reserve-empty-box">
              선택한 기간에 조회 가능한 상담 일정이 없습니다.
            </div>
          ) : (
            availableSchedules.map((item) => (
              <article
                className={`reserve-item ${item.blocked ? "blocked" : ""}`}
                key={item.id}
              >
                <div>
                  <strong>
                    {item.field} · {item.time}
                  </strong>
                  <span>{item.date}</span>
                  <small>{item.blocked ? "예약 불가" : "예약 가능"}</small>
                </div>

                <button
                  type="button"
                  className="adm-btn primary"
                  disabled={item.blocked}
                >
                  선택
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="adm-card reserve-brand-card">
        <div className="reserve-brand-empty">
          <span className="adm-brand-mark">W</span>
          <h2>WVA</h2>
          <p>상담 예약 내역</p>
          <small>예약 상태와 상담 일정을 이곳에서 확인할 수 있습니다.</small>
        </div>
      </section>
    </main>
  );
}
