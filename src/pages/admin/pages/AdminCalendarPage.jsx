import React, { useState, useRef, useEffect, useMemo } from "react";
import "./adminCalendarPage.css";
import {
  getAdminReservationList,
  getAdminReservationListByRange,
  blockAdminReservation,
  unblockAdminReservation,
  allowAdminReservation,
  disallowAdminReservation,
} from "../../../api/reservationApi";

const MONTHS_TO_FETCH = 7;

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

function formatTime(timeValue) {
  return String(timeValue || "").slice(0, 5);
}

function addMinutesToTime(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m + mins;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
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

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isBlockMode, setIsBlockMode] = useState(false);
  const [pendingBlocks, setPendingBlocks] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [blockReason, setBlockReason] = useState("");

  const isMounted = useRef(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getWeekInfo = (dateObj) => {
    const target = new Date(dateObj);
    const day = target.getDay();
    const diff = 3 - day;
    target.setDate(target.getDate() + diff);

    return {
      displayYear: target.getFullYear(),
      displayMonth: target.getMonth(),
      displayWeek: Math.floor((target.getDate() - 1) / 7) + 1,
    };
  };

  const { displayYear, displayMonth, displayWeek } = getWeekInfo(selectedDate);

  const applyListData = (data) => {
    setSchedules(data?.schedules || []);
    setBlocks(data?.blocks || []);
  };

  const fetchAdminCalendar = async () => {
    try {
      setLoading(true);
      const data = await getAdminReservationList();
      applyListData(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "관리자 예약 일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminCalendarByCurrentMonth = async () => {
    try {
      setLoading(true);
      const data = await getAdminReservationListByRange(
        getMonthStartIso(currentDate),
        MONTHS_TO_FETCH,
      );
      applyListData(data);
    } catch (err) {
      console.error(err);
      alert("일정을 새로고침하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchAdminCalendar();
    } else {
      fetchAdminCalendarByCurrentMonth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const events = useMemo(() => {
    const newEvents = [];

    const parsedBlocks = (blocks || [])
      .map((b) => ({
        id: b.id || b.block_id,
        targetId: b.id || b.block_id,
        type: "block",
        title: "일정 차단",
        date: getDateKey(b.blocked_date),
        time: formatTime(b.blocked_time),
        reason: b.reason || "관리자 차단",
        originalData: b,
      }))
      .filter((b) => b.date && b.time)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

    let lastBaseBlock = null;

    parsedBlocks.forEach((b) => {
      if (
        lastBaseBlock &&
        lastBaseBlock.date === b.date &&
        lastBaseBlock.endTime === b.time &&
        lastBaseBlock.reason === b.reason
      ) {
        lastBaseBlock.endTime = addMinutesToTime(b.time, 30);
        lastBaseBlock.slotSpan += 1;
        lastBaseBlock.mergedIds.push(b.targetId);

        newEvents.push({
          ...b,
          isExtension: true,
          endTime: addMinutesToTime(b.time, 30),
          slotSpan: 1,
        });
      } else {
        b.endTime = addMinutesToTime(b.time, 30);
        b.slotSpan = 1;
        b.isExtension = false;
        b.mergedIds = [b.targetId];

        lastBaseBlock = b;
        newEvents.push(b);
      }
    });

    (schedules || []).forEach((schedule) => {
      const dKey = getDateKey(schedule.selected_date);
      const tKey = formatTime(schedule.selected_time);
      if (dKey && tKey) {
        (schedule.reservations || []).forEach((res) => {
          // 💡 1. 불허(rejected) 처리된 예약은 아예 배열에서 제외 (화면 노출 금지)
          if (res.status === "rejected") return;

          const resId = res.reservation_id || res.id;
          const isConfirmed =
            res.status === "approved" || res.status === "confirmed";

          if (isConfirmed) {
            newEvents.push({
              id: resId,
              targetId: resId,
              type: "reservation",
              title: `[${getFieldLabel(schedule.field)}] ${res.username || "사용자"}`,
              date: dKey,
              time: tKey,
              endTime: addMinutesToTime(tKey, 90),
              slotSpan: 3,
              status: res.status,
              field: schedule.field,
              isExtension: false,
              originalData: res,
            });
            [30, 60].forEach((offsetMins, idx) => {
              const slotTime = addMinutesToTime(tKey, offsetMins);
              newEvents.push({
                id: `${resId}_ext_${idx}`,
                targetId: resId,
                type: "reservation",
                title: "상담 진행",
                date: dKey,
                time: slotTime,
                endTime: addMinutesToTime(slotTime, 30),
                slotSpan: 1,
                status: res.status,
                field: schedule.field,
                isExtension: true,
                originalData: res,
              });
            });
          } else {
            newEvents.push({
              id: resId,
              targetId: resId,
              type: "reservation",
              title: `[${getFieldLabel(schedule.field)}] ${res.username || "사용자"}`,
              date: dKey,
              time: tKey,
              endTime: addMinutesToTime(tKey, 30),
              slotSpan: 1,
              status: res.status,
              field: schedule.field,
              isExtension: false,
              originalData: res,
            });
          }
        });
      }
    });
    return newEvents;
  }, [schedules, blocks]);

  // 💡 KPI 상단 통계에서도 불허(rejected) 제외
  const allReservations = schedules
    .flatMap((s) => s.reservations || [])
    .filter((r) => r.status !== "rejected");

  const totalCount = allReservations.length;
  const pendingCount = allReservations.filter(
    (r) => r.status === "pending",
  ).length;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1),
  );

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDays(selectedDate);

  const times = Array.from({ length: 18 }, (_, i) => {
    const hour = String(Math.floor(i / 2) + 9).padStart(2, "0");
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  });

  const formatDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleMonthChange = (targetMonthIndex) => {
    const newDate = new Date(year, targetMonthIndex, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleSlotClick = (dateStr, timeStr, slotEvents, isPast) => {
    // 💡 과거의 빈칸은 클릭 방지
    if (isPast && slotEvents.length === 0) return;

    if (isBlockMode) {
      if (slotEvents.length > 0) return;
      const slotKey = `${dateStr}_${timeStr}`;
      setPendingBlocks((prev) =>
        prev.includes(slotKey)
          ? prev.filter((k) => k !== slotKey)
          : [...prev, slotKey],
      );
    } else {
      if (slotEvents.length > 0) {
        const targetIds = slotEvents.map((e) => e.targetId);
        const baseEvents = events.filter(
          (e) => targetIds.includes(e.targetId) && !e.isExtension,
        );

        setSelectedSlot({
          date: dateStr,
          time: timeStr,
          allEvents: baseEvents,
        });
        setModalType("info");
        setModalOpen(true);
      }
    }
  };

  const handleCreateBlock = async () => {
    if (!blockReason.trim()) return alert("불가 사유를 입력해 주세요.");
    try {
      setLoading(true);
      await Promise.all(
        pendingBlocks.map((slotKey) => {
          const [date, time] = slotKey.split("_");
          return blockAdminReservation({
            selectedDate: getSelectedDateIso(date),
            selectedTime: time,
            blockedDate: getSelectedDateIso(date),
            blockedTime: time,
            field: null,
            reason: blockReason.trim() || null,
          });
        }),
      );
      alert("선택한 일정이 모두 차단되었습니다.");
      setModalOpen(false);
      setIsBlockMode(false);
      setPendingBlocks([]);
      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      console.error(err);
      alert(err.message || "예약 차단에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (ids) => {
    if (window.confirm("선택한 차단 일정을 해제하시겠습니까?")) {
      try {
        setLoading(true);
        const idArray = Array.isArray(ids) ? ids : [ids];
        await Promise.all(idArray.map((id) => unblockAdminReservation(id)));
        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert("차단 해제에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApprove = async (event) => {
    if (
      window.confirm(
        "상담 요청을 승인하시겠습니까? 승인 시 선택된 시간으로 예약이 확정됩니다.",
      )
    ) {
      try {
        setLoading(true);

        const reservation = event.originalData || {};
        const selectedRange = (reservation.available_ranges || []).find(
          (range) =>
            getDateKey(range.date) === event.date &&
            formatTime(range.start_time) === event.time,
        );

        await allowAdminReservation({
          reservationId: event.targetId || event.id,
          date: selectedRange?.date || event.date,
          startTime: formatTime(selectedRange?.start_time || event.time),
          endTime: formatTime(
            selectedRange?.end_time || addMinutesToTime(event.time, 90),
          ),
        });

        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert(err.message || "승인 처리에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleReject = async (id) => {
    const reason = window.prompt(
      "불허/취소 사유를 입력해 주세요. (미입력 가능)",
      "",
    );
    if (reason === null) return;
    if (window.confirm("정말 이 상담 신청을 불허(취소)하시겠습니까?")) {
      try {
        setLoading(true);
        await disallowAdminReservation([
          { id, reason: reason.trim() || null },
        ]);
        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert("불허 처리에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedDateStr = formatDate(selectedDate);
  const selectedDateEvents = events
    .filter((e) => e.date === selectedDateStr && !e.isExtension)
    .sort((a, b) => a.time.localeCompare(b.time));

  const todayStr = formatDate(new Date());
  // 💡 현재 시각 객체 (과거 시간 회색 처리용)
  const now = new Date();

  return (
    <div className="cal-page-wrap">
      <div className="cal-page-header">
        <div>
          <h1 className="cal-page-title">예약 현황 관리</h1>
          <p className="cal-page-subtitle">
            Manage consultations and schedule blocks
          </p>
        </div>
      </div>

      <div className="cal-kpi-grid">
        <div className="cal-kpi-card">
          <span className="cal-kpi-label">누적 예약 건수</span>
          <strong className="cal-kpi-value">{totalCount}</strong>
        </div>
        <div className="cal-kpi-card">
          <span className="cal-kpi-label">승인 대기 예약</span>
          <strong className="cal-kpi-value orange">{pendingCount}</strong>
        </div>
        <div className="cal-kpi-card">
          <span className="cal-kpi-label">활성화된 예약 (대기+승인)</span>
          <strong className="cal-kpi-value blue">
            {
              allReservations.filter(
                (r) =>
                  r.status === "pending" ||
                  r.status === "approved" ||
                  r.status === "confirmed",
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="cal-layout">
        <div className="cal-left-panel">
          <div className="cal-panel-box">
            <div className="mini-cal-header">
              <button
                className="mini-cal-nav ghost"
                onClick={() => handleMonthChange(month - 1)}
              >
                ◀
              </button>
              <span>
                {year}. {String(month + 1).padStart(2, "0")}
              </span>
              <button
                className="mini-cal-nav ghost"
                onClick={() => handleMonthChange(month + 1)}
              >
                ▶
              </button>
            </div>
            <div className="mini-cal-grid">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="mini-cal-day-label">
                  {d}
                </div>
              ))}
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((d) => {
                const dStr = formatDate(d);
                const hasEvent = events.some((e) => e.date === dStr);
                const isSelected = selectedDateStr === dStr;
                return (
                  <div
                    key={dStr}
                    className={`mini-cal-day ${isSelected ? "selected" : ""} ${hasEvent ? "has-event" : ""}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cal-panel-box detail-panel-box">
            <div className="cal-panel-title sticky-header">
              {month + 1}월 {selectedDate.getDate()}일 상세 현황
            </div>
            <div className="day-event-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((e) => (
                  <div
                    key={e.id}
                    className="day-event-item"
                    onClick={() => handleSlotClick(e.date, e.time, [e], false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        className={`day-event-badge badge-${e.type === "block" ? "block" : e.status}`}
                      >
                        {e.type === "block"
                          ? "차단됨"
                          : e.status === "pending"
                            ? "승인 대기"
                            : e.status === "approved" ||
                                e.status === "confirmed"
                              ? "승인 확정"
                              : "상태 없음"}
                      </span>
                      <span className="day-event-time">
                        {e.time} ~ {e.endTime}
                      </span>
                    </div>
                    <span className="day-event-title">{e.title}</span>
                  </div>
                ))
              ) : (
                <div className="day-empty-msg">등록된 일정이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        <div className="cal-panel-box weekly-panel-box">
          <div className="weekly-header">
            <h2 className="weekly-title">
              {displayYear}년 {displayMonth + 1}월 {displayWeek}주차 일정
              {loading && (
                <span className="loading-text">데이터 갱신 중...</span>
              )}
            </h2>

            <div className="weekly-actions">
              <button
                className="adm-btn ghost"
                onClick={fetchAdminCalendarByCurrentMonth}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "6px" }}
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                새로고침
              </button>
            </div>
          </div>

          <div className="weekly-grid-container">
            <div className="weekly-grid">
              <div className="grid-col-header time-label-header"></div>

              {weekDays.map((d) => {
                const isToday = formatDate(d) === todayStr;
                return (
                  <div
                    key={d.toISOString()}
                    className={`grid-col-header ${isToday ? "today" : ""}`}
                  >
                    <span className="day-name">
                      {["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}
                    </span>
                    <span className="day-date">{d.getDate()}</span>
                  </div>
                );
              })}

              {times.map((time) => {
                const isHalfHour = time.endsWith(":30");
                const isFullHour = time.endsWith(":00");

                return (
                  <React.Fragment key={time}>
                    <div
                      className={`time-label-col ${isHalfHour ? "half-hour" : "full-hour"}`}
                    >
                      {isFullHour ? <span>{time}</span> : null}
                    </div>

                    {weekDays.map((d) => {
                      const dateStr = formatDate(d);
                      const slotEvents = events.filter(
                        (e) => e.date === dateStr && e.time === time,
                      );

                      const baseEvents = slotEvents.filter(
                        (e) => !e.isExtension,
                      );
                      const displayEvent = baseEvents[0];
                      const extraCount = baseEvents.length - 1;

                      // 💡 2. 이미 지나간 과거 시간 판별
                      const [hh, mm] = time.split(":").map(Number);
                      const slotDateTime = new Date(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                        hh,
                        mm,
                        0,
                      );
                      const isPast = slotDateTime < now;

                      // 💡 3. 과거 시간은 블록 생성 모드 금지
                      const isBlockable =
                        isBlockMode && slotEvents.length === 0 && !isPast;
                      const slotKey = `${dateStr}_${time}`;
                      const isSelected = pendingBlocks.includes(slotKey);

                      return (
                        <div
                          key={`${dateStr}-${time}`}
                          className={`grid-cell ${isHalfHour ? "half-hour" : ""} ${isBlockable ? "blockable" : ""} ${isSelected ? "selected-for-block" : ""} ${isPast && !displayEvent ? "past-slot" : ""}`}
                          onClick={() =>
                            handleSlotClick(dateStr, time, slotEvents, isPast)
                          }
                        >
                          {displayEvent && (
                            <div
                              // 💡 지나간 일정은 시각적으로 약간 투명해지도록 past-event 추가
                              className={`event-card ${displayEvent.type === "block" ? "block" : displayEvent.status} ${isPast ? "past-event" : ""}`}
                              style={{
                                height: `calc(${displayEvent.slotSpan * 100}% - 2px)`,
                                zIndex: 10 + displayEvent.slotSpan,
                              }}
                            >
                              <span className="event-title">
                                {displayEvent.title}
                              </span>
                              {extraCount > 0 && (
                                <span className="event-extra">
                                  +{extraCount} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="weekly-footer">
            {isBlockMode ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="adm-btn secondary"
                  onClick={() => {
                    setIsBlockMode(false);
                    setPendingBlocks([]);
                  }}
                >
                  선택 취소
                </button>
                <button
                  className="adm-btn danger"
                  onClick={() => {
                    if (pendingBlocks.length === 0)
                      return alert(
                        "표에서 차단할 일정을 먼저 1개 이상 클릭해 주세요.",
                      );
                    setBlockReason("");
                    setModalType("create-block");
                    setModalOpen(true);
                  }}
                >
                  선택한 {pendingBlocks.length}개 일정 차단하기
                </button>
              </div>
            ) : (
              <button
                className="adm-btn primary"
                onClick={() => setIsBlockMode(true)}
              >
                일정 차단 모드
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal" style={{ maxWidth: "440px" }}>
            {modalType === "info" ? (
              <>
                <h3 className="modal-title">
                  {selectedSlot.allEvents.length > 1
                    ? "해당 시간 일정 목록"
                    : selectedSlot.allEvents[0].type === "block"
                      ? "차단 일정 상세"
                      : "예약 상세 정보"}
                </h3>
                <div className="modal-content-scroll">
                  {selectedSlot.allEvents.map((evt, idx) => (
                    <div key={evt.id || idx} className="modal-info-card">
                      <p>
                        <strong>시간:</strong> {evt.time} ~ {evt.endTime}
                      </p>
                      <p>
                        <strong>상태:</strong>
                        <span
                          className={`day-event-badge badge-${evt.type === "block" ? "block" : evt.status}`}
                          style={{ marginLeft: "8px" }}
                        >
                          {evt.type === "block"
                            ? "차단됨"
                            : evt.status === "pending"
                              ? "승인 대기"
                              : "승인 확정"}
                        </span>
                      </p>
                      <p>
                        <strong>내용:</strong> {evt.title}
                      </p>
                      {evt.reason && (
                        <p>
                          <strong>사유:</strong> {evt.reason}
                        </p>
                      )}
                      <div
                        className="modal-actions"
                        style={{
                          marginTop: "16px",
                          justifyContent: "flex-start",
                        }}
                      >
                        {evt.type === "block" ? (
                          <button
                            className="adm-btn danger"
                            onClick={() =>
                              handleUnblock(
                                evt.mergedIds || evt.targetId || evt.id,
                              )
                            }
                          >
                            차단 해제
                          </button>
                        ) : (
                          <>
                            {evt.status === "pending" && (
                              <button
                                className="adm-btn primary"
                                onClick={() =>
                                  handleApprove(evt)
                                }
                              >
                                승인 확정
                              </button>
                            )}
                            {(evt.status === "pending" ||
                              evt.status === "approved" ||
                              evt.status === "confirmed") && (
                              <button
                                className="adm-btn danger"
                                onClick={() =>
                                  handleReject(evt.targetId || evt.id)
                                }
                              >
                                예약 취소
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    className="adm-btn secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    닫기
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="modal-title">다중 일정 차단</h3>
                <div className="modal-content">
                  <p className="modal-desc">
                    <strong>선택된 구간:</strong> 총{" "}
                    <strong>{pendingBlocks.length}</strong>개 (30분 단위)
                  </p>
                  <label className="modal-label">차단 일괄 사유</label>
                  <textarea
                    className="modal-textarea"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="사유를 입력하세요 (예: 외부 미팅, 세미나 등)"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="adm-btn secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    취소
                  </button>
                  <button
                    className="adm-btn danger"
                    onClick={handleCreateBlock}
                  >
                    일괄 차단
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
