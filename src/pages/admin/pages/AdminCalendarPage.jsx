import { useEffect, useMemo, useState } from "react";
import YearMonthPicker from "../../../components/YearMonthPicker";
import {
  getAdminReservationList,
  getAdminReservationListByRange,
  blockAdminReservation,
  unblockAdminReservation,
  allowAdminReservation,
  disallowAdminReservation,
} from "../../../api/reservationApi";
import "../admin.css";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS_TO_FETCH = 7;

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
  { label: "전체", value: null },
  { label: "인사", value: "hr" },
  { label: "노무", value: "labor" },
  { label: "회계", value: "accounting" },
  { label: "법무", value: "law" },
];

function getDateKey(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStartIso(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function getSelectedDateIso(dateKey) {
  return `${dateKey}T00:00:00.000Z`;
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) days.push(null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(getDateKey(new Date(year, month, day)));
  }

  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function formatTime(timeValue) {
  return String(timeValue || "").slice(0, 5);
}

function getFieldLabel(field) {
  switch (field) {
    case "law":
      return "법무";
    case "accounting":
      return "회계";
    case "hr":
      return "인사";
    case "labor":
      return "노무";
    case null:
      return "전체";
    default:
      return field || "전체";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "승인 대기";
    case "approved":
      return "승인 완료";
    case "rejected":
      return "불허";
    case "cancelled":
      return "취소 완료";
    default:
      return status || "-";
  }
}

export default function AdminCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [requestYear, setRequestYear] = useState(today.getFullYear());
  const [requestMonth, setRequestMonth] = useState(today.getMonth() + 1);

  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [selectedBlockTimes, setSelectedBlockTimes] = useState(["09:00"]);
  const [selectedBlockFields, setSelectedBlockFields] = useState([null]);
  const [blockReason, setBlockReason] = useState("");

  const [decisionLoadingId, setDecisionLoadingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyListData = (data) => {
    setSchedules(data.schedules || []);
    setBlocks(data.blocks || []);
  };

  const fetchAdminCalendar = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await getAdminReservationList();
      applyListData(data);
    } catch (err) {
      setError(err.message || "관리자 예약 일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCalendarByCurrentMonth = async () => {
    const data = await getAdminReservationListByRange(
      getMonthStartIso(viewDate),
      MONTHS_TO_FETCH
    );

    applyListData(data);
  };

  useEffect(() => {
    fetchAdminCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const reservationsByDate = useMemo(() => {
    const result = {};

    schedules.forEach((schedule) => {
      const dateKey = getDateKey(schedule.selected_date);
      if (!dateKey) return;

      (schedule.reservations || []).forEach((reservation) => {
        result[dateKey] = [
          ...(result[dateKey] || []),
          {
            ...reservation,
            schedule_id: schedule.schedule_id,
            field: schedule.field,
            selected_date: schedule.selected_date,
            selected_time: schedule.selected_time,
          },
        ];
      });
    });

    return result;
  }, [schedules]);

  const blocksByDate = useMemo(() => {
    const result = {};

    blocks.forEach((block) => {
      const dateKey = getDateKey(block.blocked_date);
      if (!dateKey) return;
      result[dateKey] = [...(result[dateKey] || []), block];
    });

    return result;
  }, [blocks]);

  const selectedReservations = reservationsByDate[selectedDate] || [];
  const selectedBlocks = blocksByDate[selectedDate] || [];

  const handlePrevMonth = () => {
    const nextMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() - 1,
      1
    );

    setViewDate(nextMonth);
    setSelectedDate(getDateKey(nextMonth));
    setRequestYear(nextMonth.getFullYear());
    setRequestMonth(nextMonth.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      1
    );

    setViewDate(nextMonth);
    setSelectedDate(getDateKey(nextMonth));
    setRequestYear(nextMonth.getFullYear());
    setRequestMonth(nextMonth.getMonth() + 1);
  };

  const handleRefreshReservationList = async () => {
    const nextMonth = new Date(requestYear, requestMonth - 1, 1);

    try {
      setIsRefreshingList(true);
      setError("");
      setSuccess("");

      const data = await getAdminReservationListByRange(
        getMonthStartIso(nextMonth),
        MONTHS_TO_FETCH
      );

      setViewDate(nextMonth);
      setSelectedDate(getDateKey(nextMonth));
      applyListData(data);
    } catch (err) {
      setError(err.message || "관리자 예약 일정을 불러오지 못했습니다.");
    } finally {
      setIsRefreshingList(false);
    }
  };

  const handleToggleBlockField = (fieldValue) => {
    if (fieldValue === null) {
      setSelectedBlockFields([null]);
      return;
    }

    setSelectedBlockFields((prev) => {
      const withoutAll = prev.filter((item) => item !== null);

      if (withoutAll.includes(fieldValue)) {
        const next = withoutAll.filter((item) => item !== fieldValue);
        return next.length > 0 ? next : [null];
      }

      return [...withoutAll, fieldValue];
    });
  };

  const handleToggleBlockTime = (time) => {
    setSelectedBlockTimes((prev) => {
      if (prev.includes(time)) {
        const next = prev.filter((item) => item !== time);
        return next.length > 0 ? next : ["09:00"];
      }

      return [...prev, time];
    });
  };

  const handleBlockSchedule = async () => {
    if (!selectedDate) {
      setError("차단할 날짜를 선택해 주세요.");
      return;
    }

    if (!selectedBlockTimes.length) {
      setError("차단할 시간을 선택해 주세요.");
      return;
    }

    if (!blockReason.trim()) {
      setError("차단 사유를 입력해 주세요.");
      return;
    }

    const ok = window.confirm(
      `${selectedDate} ${selectedBlockTimes.join(", ")} 일정을 차단하시겠습니까?`
    );

    if (!ok) return;

    try {
      setIsBlocking(true);
      setError("");
      setSuccess("");

      await Promise.all(
        selectedBlockTimes.flatMap((time) =>
          selectedBlockFields.map((field) =>
            blockAdminReservation({
              field,
              selectedDate: getSelectedDateIso(selectedDate),
              selectedTime: time,
              reason: blockReason.trim(),
            })
          )
        )
      );

      setSuccess("선택한 일정이 차단되었습니다.");
      setBlockReason("");

      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      setError(err.message || "예약 차단에 실패했습니다.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockSchedule = async (blockId) => {
    const ok = window.confirm("선택한 차단 일정을 해제하시겠습니까?");

    if (!ok) return;

    try {
      setError("");
      setSuccess("");

      await unblockAdminReservation(blockId);

      setSuccess("차단 일정이 해제되었습니다.");

      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      setError(err.message || "차단 해제에 실패했습니다.");
    }
  };

  const handleApproveReservation = async (reservationId) => {
    const ok = window.confirm("이 상담 신청을 승인하시겠습니까?");
    if (!ok) return;

    try {
      setDecisionLoadingId(reservationId);
      setError("");
      setSuccess("");

      await allowAdminReservation([
        {
          id: reservationId,
          approved: true,
          reason: null,
        },
      ]);

      setSuccess("상담 신청이 승인되었습니다.");
      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      setError(err.message || "상담 승인 처리에 실패했습니다.");
    } finally {
      setDecisionLoadingId(null);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    const reason = window.prompt(
      "불허 사유를 입력해 주세요. 비워두면 기본 사유가 저장됩니다.",
      ""
    );

    if (reason === null) return;

    const ok = window.confirm("이 상담 신청을 불허하시겠습니까?");
    if (!ok) return;

    try {
      setDecisionLoadingId(reservationId);
      setError("");
      setSuccess("");

      await disallowAdminReservation([
        {
          id: reservationId,
          approved: false,
          reason: reason.trim() || null,
        },
      ]);

      setSuccess("상담 신청이 불허되었습니다.");
      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      setError(err.message || "상담 불허 처리에 실패했습니다.");
    } finally {
      setDecisionLoadingId(null);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <p className="adm-eyebrow">Reservations Calendar</p>
          <h2>예약 캘린더</h2>
          <span>날짜별 예약 신청 현황과 차단된 일정을 확인합니다.</span>
        </div>

        <button
          type="button"
          className="adm-btn ghost"
          onClick={fetchAdminCalendar}
          disabled={loading}
        >
          {loading ? "조회 중..." : "새로고침"}
        </button>
      </div>

      {error && <section className="adm-card admin-alert error">{error}</section>}

      {success && (
        <section className="adm-card admin-alert success">{success}</section>
      )}

      <section className="adm-card">
        <div className="adm-card-head">
          <h2>월간 예약 현황</h2>

          <div className="admin-calendar-tools">
            <div className="admin-calendar-picker-row">
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
                className="adm-btn primary"
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
          </div>
        </div>

        {loading ? (
          <div className="adm-empty admin-loading">
            예약 데이터를 불러오는 중입니다.
          </div>
        ) : (
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

                const reservationCount = (reservationsByDate[date] || []).filter(
                  (reservation) => reservation.status === "approved"
                ).length;
                const blockCount = (blocksByDate[date] || []).length;

                return (
                  <button
                    key={date}
                    type="button"
                    className={[
                      "adm-day",
                      selectedDate === date ? "selected" : "",
                      blockCount > 0 ? "blocked" : "",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedDate(date);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <span>{Number(date.slice(8, 10))}</span>
                    {reservationCount > 0 && <b>{reservationCount}</b>}
                    {blockCount > 0 && <em>BLOCK</em>}
                  </button>
                );
              })}
            </div>

            <aside className="adm-side-panel">
              <div className="adm-side-panel-head">
                <h3>{selectedDate}</h3>

                <span className="admin-side-count">
                  예약{" "}
                  <strong className="blue">
                    {selectedReservations.length}
                  </strong>
                  건 / 블락{" "}
                  <strong className="red">{selectedBlocks.length}</strong>건
                </span>
              </div>

              <section className="admin-block-panel">
                <h4>예약 차단</h4>

                <div className="admin-block-stack">
                  <div>
                    <small className="admin-block-label">차단 시간</small>

                    <div className="admin-block-grid time-grid">
                      {TIME_OPTIONS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`adm-btn ${
                            selectedBlockTimes.includes(time) ? "danger" : "ghost"
                          }`}
                          onClick={() => handleToggleBlockTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <small className="admin-block-label">차단 분야</small>

                    <div className="admin-block-grid field-grid">
                      {FIELD_OPTIONS.map((field) => {
                        const isSelected = selectedBlockFields.includes(
                          field.value
                        );

                        return (
                          <button
                            key={field.label}
                            type="button"
                            className={`adm-btn ${
                              isSelected ? "danger" : "ghost"
                            }`}
                            onClick={() => handleToggleBlockField(field.value)}
                          >
                            {field.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="차단 사유를 입력하세요"
                    className="admin-block-reason"
                  />

                  <button
                    type="button"
                    className="adm-btn danger"
                    onClick={handleBlockSchedule}
                    disabled={isBlocking}
                  >
                    {isBlocking ? "차단 중..." : "선택 일정 예약 막기"}
                  </button>
                </div>
              </section>

              {selectedBlocks.length > 0 && (
                <div className="admin-block-list">
                  {selectedBlocks.map((block) => (
                  <div key={block.id} className="admin-block-item">
                    <div>
                      <strong>
                        [{getFieldLabel(block.field)}] {formatTime(block.blocked_time)}
                      </strong>

                      <strong> 사유: {block.reason || "-"}</strong>
                    </div>

                    <button
                      type="button"
                      className="adm-btn ghost"
                      onClick={() => handleUnblockSchedule(block.id)}
                    >
                      해제
                    </button>
                  </div>
                  ))}
                </div>
              )}

              {selectedReservations.length === 0 ? (
                <div className="adm-empty admin-empty-panel">
                  이 날짜에는 예약 신청이 없습니다.
                </div>
              ) : (
              <div className="admin-reservation-list">
                {selectedReservations.map((reservation) => (
                  <div
                    key={reservation.reservation_id}
                    className="admin-reservation-card"
                  >
                    <div className="admin-reservation-top">
                      <div>
                        <strong className="admin-reservation-name">
                          {reservation.username}
                        </strong>
                        <span className="admin-reservation-field">
                          {getFieldLabel(reservation.field)} ·{" "}
                          {formatTime(reservation.selected_time)}
                        </span>
                      </div>

                      <span className={`status status-${reservation.status}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>

                    <div className="admin-reservation-info">
                      <span>{reservation.email}</span>
                      <span>신청일: {formatDate(reservation.requested_at)}</span>
                    </div>

                    {reservation.status === "pending" && (
                      <div className="admin-decision-actions">
                        <button
                          type="button"
                          className="adm-btn primary"
                          disabled={decisionLoadingId === reservation.reservation_id}
                          onClick={() =>
                            handleApproveReservation(reservation.reservation_id)
                          }
                        >
                          {decisionLoadingId === reservation.reservation_id
                            ? "처리 중..."
                            : "허락"}
                        </button>

                        <button
                          type="button"
                          className="adm-btn danger"
                          disabled={decisionLoadingId === reservation.reservation_id}
                          onClick={() =>
                            handleRejectReservation(reservation.reservation_id)
                          }
                        >
                          불허
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}