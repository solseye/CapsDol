import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import "./adminCalendarPage.css";
import {
  getAdminReservationList,
  getAdminReservationListByRange,
  blockAdminReservation,
  cancelReservation,
  unblockAdminReservation,
  allowAdminReservation,
  disallowAdminReservation,
  syncTimeTreeReservations,
} from "../../../api/reservationApi";
import {
  addMinutesToTime,
  buildAdminCalendarEvents,
  getDayTimeSlots,
  getDateKey,
  getWeekDays,
  getWeekInfo,
} from "../utils/calendarUtils";
import { getCurrentLanguage } from "../../../i18n/translations";

const SLOT_MINUTES = 30;
const RESERVATION_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#d97706",
  "#4f46e5",
  "#9333ea",
  "#0ea5e9",
  "#a855f7",
  "#f59e0b",
  "#64748b",
];
const FIELD_FILTERS = [
  { value: "회계", label: "회계" },
  { value: "법무", label: "법무" },
];
const BLOCK_REASON_OPTIONS = [
  {
    value: "내부 회의",
    label: { ko: "내부 회의", en: "Internal meeting", ja: "社内会議" },
  },
  {
    value: "휴무",
    label: { ko: "휴무", en: "Office closed", ja: "休業" },
  },
  {
    value: "외부 일정",
    label: { ko: "외부 일정", en: "Off-site schedule", ja: "外出予定" },
  },
  {
    value: "상담 준비 시간",
    label: {
      ko: "상담 준비 시간",
      en: "Consultation preparation",
      ja: "相談準備時間",
    },
  },
];
const BLOCK_MODAL_COPY = {
  ko: {
    modalTitle: "일정 차단",
    selectedRange: "선택 범위",
    reasonLegend: "차단 사유를 선택해 주세요",
    multiHint: "여러 사유를 함께 선택할 수 있습니다.",
    cancel: "취소",
    submit: "범위 차단",
    reasonRequired: "차단 사유를 하나 이상 선택해 주세요.",
    rangeRequired: "차단할 시간 범위를 먼저 선택해 주세요.",
    success: "선택한 시간 범위를 차단했습니다.",
    failure: "예약 차단에 실패했습니다.",
  },
  en: {
    modalTitle: "Block schedule",
    selectedRange: "Selected range",
    reasonLegend: "Select a reason for blocking",
    multiHint: "You can select more than one reason.",
    cancel: "Cancel",
    submit: "Block range",
    reasonRequired: "Select at least one reason.",
    rangeRequired: "Select a time range to block first.",
    success: "The selected time range has been blocked.",
    failure: "Failed to block the schedule.",
  },
  ja: {
    modalTitle: "予定をブロック",
    selectedRange: "選択範囲",
    reasonLegend: "ブロック理由を選択してください",
    multiHint: "複数の理由を選択できます。",
    cancel: "キャンセル",
    submit: "範囲をブロック",
    reasonRequired: "ブロック理由を1つ以上選択してください。",
    rangeRequired: "先にブロックする時間範囲を選択してください。",
    success: "選択した時間範囲をブロックしました。",
    failure: "予定のブロックに失敗しました。",
  },
};

function timeToMinutes(time) {
  const [hour, minute] = String(time || "00:00")
    .split(":")
    .map(Number);
  return hour * 60 + minute;
}

function getOrderedRange(startTime, endTime) {
  const startsFirst = timeToMinutes(startTime) <= timeToMinutes(endTime);
  const rangeStart = startsFirst ? startTime : endTime;
  const rangeEnd = startsFirst ? endTime : startTime;

  return {
    startTime: rangeStart,
    endTime: addMinutesToTime(rangeEnd, SLOT_MINUTES),
    startMinutes: timeToMinutes(rangeStart),
    endMinutes: timeToMinutes(rangeEnd) + SLOT_MINUTES,
  };
}

function isTimeInsideRange(time, startTime, endTime) {
  const current = timeToMinutes(time);
  const range = getOrderedRange(startTime, endTime);
  return current >= range.startMinutes && current < range.endMinutes;
}

function canApproveSlot(reservation, date, time) {
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + SLOT_MINUTES;

  return (reservation?.available_ranges || []).some((range) => {
    if (getDateKey(range.date) !== date) return false;

    return (
      timeToMinutes(range.start_time) <= slotStart &&
      timeToMinutes(range.end_time) >= slotEnd
    );
  });
}

function getReservationKey(reservation) {
  return String(
    reservation?.reservation_id ||
      reservation?.id ||
      reservation?.phone ||
      reservation?.username ||
      "unknown",
  );
}

function getReservationColor(key) {
  const chars = String(key);
  const hash = Array.from(chars).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return RESERVATION_COLORS[hash % RESERVATION_COLORS.length];
}

function getRangeLabel(range) {
  return `${String(range.start_time || "").slice(0, 5)} ~ ${String(
    range.end_time || "",
  ).slice(0, 5)}`;
}

function isRangeSlot(range, date, time) {
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + SLOT_MINUTES;

  return (
    getDateKey(range.date) === date &&
    timeToMinutes(range.start_time) <= slotStart &&
    timeToMinutes(range.end_time) >= slotEnd
  );
}

function getDiagonalAvailabilityBackground(paints) {
  if (paints.length === 0) return undefined;
  if (paints.length === 1) {
    return `color-mix(in srgb, ${paints[0].color} 18%, #ffffff)`;
  }

  const step = 100 / paints.length;
  const stops = paints.map((paint, index) => {
    const start = Number((index * step).toFixed(2));
    const end = Number(((index + 1) * step).toFixed(2));
    return `color-mix(in srgb, ${paint.color} 18%, #ffffff) ${start}% ${end}%`;
  });

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

function hasAvailabilityAt(paints, date, time) {
  return paints.some((paint) => isRangeSlot(paint.range, date, time));
}

function getDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthDateRange(dateValue) {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const formatDate = (targetDate) => {
    const targetYear = targetDate.getFullYear();
    const targetMonth = String(
      targetDate.getMonth() + 1
    ).padStart(2, "0");
    const targetDay = String(
      targetDate.getDate()
    ).padStart(2, "0");

    return `${targetYear}-${targetMonth}-${targetDay}`;
  };

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function getBlockRangesFromKeys(slotKeys) {
  const sortedSlots = [...new Set(slotKeys)]
    .map((slotKey) => {
      const dividerIndex = slotKey.lastIndexOf("_");
      return {
        date: slotKey.slice(0, dividerIndex),
        time: slotKey.slice(dividerIndex + 1),
      };
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

  return sortedSlots.reduce((ranges, slot) => {
    const lastRange = ranges[ranges.length - 1];

    if (
      lastRange &&
      lastRange.date === slot.date &&
      lastRange.endTime === slot.time
    ) {
      lastRange.endTime = addMinutesToTime(slot.time, SLOT_MINUTES);
      lastRange.slotCount += 1;
      return ranges;
    }

    ranges.push({
      date: slot.date,
      startTime: slot.time,
      endTime: addMinutesToTime(slot.time, SLOT_MINUTES),
      slotCount: 1,
    });
    return ranges;
  }, []);
}

function isSlotInsideBlockRanges(ranges, date, time) {
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + SLOT_MINUTES;

  return ranges.some(
    (range) =>
      range.date === date &&
      timeToMinutes(range.startTime) <= slotStart &&
      timeToMinutes(range.endTime) >= slotEnd,
  );
}

function hasTimeTreeSyncChanges(syncResult) {
  return (
    Number(syncResult?.createdCount || 0) > 0 ||
    Number(syncResult?.updatedCount || 0) > 0 ||
    Number(syncResult?.deletedCount || 0) > 0
  );
}

// 예약/차단 데이터를 주간 캘린더 UI로 조작하는 관리자 화면입니다.
export default function AdminCalendarPage() {
  const language = getCurrentLanguage();
  const blockCopy = BLOCK_MODAL_COPY[language] || BLOCK_MODAL_COPY.ko;
  // 현재 월, 선택 날짜, 서버 데이터, 모달 상태를 한 페이지에서 함께 관리합니다.
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isBlockMode, setIsBlockMode] = useState(false);
  const [pendingBlocks, setPendingBlocks] = useState([]);
  const [dragSelection, setDragSelection] = useState(null);
  const [approvalDraft, setApprovalDraft] = useState(null);
  const [approvalFocus, setApprovalFocus] = useState(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBlockReasons, setSelectedBlockReasons] = useState([]);
  const [fieldFilter, setFieldFilter] = useState("회계");

  const isMounted = useRef(false);
  const loadedRangeRef = useRef(null);
  const isTimeTreeSyncingRef = useRef(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { displayYear, displayMonth, displayWeek } = getWeekInfo(selectedDate);

  // 서버 응답 형태를 화면 상태에 맞게 반영합니다.
  const applyListData = useCallback((data) => {
    setSchedules(data?.schedules || []);
    setBlocks(data?.blocks || []);
  }, []);

  const syncCurrentMonthTimeTree = useCallback(async () => {
    if (isTimeTreeSyncingRef.current) {
      return null;
    }

    const { startDate, endDate } =
      getMonthDateRange(currentDate);

    try {
      isTimeTreeSyncingRef.current = true;

      return await syncTimeTreeReservations({
        startDate,
        endDate,
      });
    } finally {
      isTimeTreeSyncingRef.current = false;
    }
  }, [currentDate]);

  // 최초 진입 시 관리자 예약/차단 전체 목록을 가져옵니다.
  const fetchAdminCalendar = useCallback(async () => {
    try {
      setLoading(true);

      await syncCurrentMonthTimeTree();

      const data = await getAdminReservationList();

      applyListData(data);
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "관리자 예약 일정을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [applyListData, syncCurrentMonthTimeTree]);

  // 월 이동이나 새로고침 시 현재 월 주변 범위만 다시 조회합니다.
  const fetchAdminCalendarByCurrentMonth = useCallback(
    async () => {
      try {
        setLoading(true);

        const baseDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-01`;

        await syncCurrentMonthTimeTree();

        const data =
          await getAdminReservationListByRange({
            baseDate,
            previousMonthCount: 2,
            nextMonthCount: 4,
          });

        applyListData(data);

        const base = new Date(`${baseDate}T00:00:00`);

        const start = new Date(
          base.getFullYear(),
          base.getMonth() - 2,
          1
        );

        const end = new Date(
          base.getFullYear(),
          base.getMonth() + 5,
          0
        );

        loadedRangeRef.current = {
          start: `${start.getFullYear()}-${String(
            start.getMonth() + 1
          ).padStart(2, "0")}-01`,

          end: `${end.getFullYear()}-${String(
            end.getMonth() + 1
          ).padStart(2, "0")}-${String(
            end.getDate()
          ).padStart(2, "0")}`,
        };
      } catch (err) {
        console.error(err);

        alert(
          err.message ||
            "일정을 새로고침하지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      applyListData,
      currentDate,
      syncCurrentMonthTimeTree,
    ]
  );

  const refreshCalendar = useCallback(async () => {
    try {
      const syncResult = await syncCurrentMonthTimeTree();

      if (!syncResult) {
        return;
      }

      if (!hasTimeTreeSyncChanges(syncResult)) {
        return;
      }

      const baseDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const data = await getAdminReservationListByRange({
        baseDate,
        previousMonthCount: 2,
        nextMonthCount: 4,
      });

      applyListData(data);
    } catch (err) {
      console.error(
        "TimeTree 자동 동기화 실패:",
        err
      );
    }
  }, [
    applyListData,
    currentDate,
    syncCurrentMonthTimeTree,
  ]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    setIsAdmin(!!token && role === "admin");
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    if (!isMounted.current) {
      isMounted.current = true;
      fetchAdminCalendar();
    } else {
      fetchAdminCalendarByCurrentMonth();
    }
  }, [
    isAdmin,
    year,
    month,
    fetchAdminCalendar,
    fetchAdminCalendarByCurrentMonth,
  ]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshCalendar();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAdmin, refreshCalendar]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCalendar();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [isAdmin, refreshCalendar]);

  // 서버 데이터를 캘린더 셀에 바로 배치할 이벤트 목록으로 변환합니다.
  const filteredSchedules = useMemo(
    () =>
      fieldFilter
        ? schedules.filter((schedule) => schedule.field === fieldFilter)
        : [],
    [fieldFilter, schedules],
  );

  const filteredBlocks = useMemo(
    () =>
      fieldFilter
        ? blocks.filter((block) => !block.field || block.field === fieldFilter)
        : [],
    [blocks, fieldFilter],
  );

  const events = useMemo(
    () =>
      buildAdminCalendarEvents({
        schedules: filteredSchedules,
        blocks: filteredBlocks,
      }),
    [filteredBlocks, filteredSchedules],
  );

  const allReservations = filteredSchedules
    .flatMap((s) => s.reservations || [])
    .filter((r) => {
      const status = String(r.status || "").toLowerCase();
      return !["rejected", "cancelled", "canceled"].includes(status);
    });

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

  const weekDays = getWeekDays(selectedDate);
  const times = getDayTimeSlots();
  const selectedBlockRanges = useMemo(
    () => getBlockRangesFromKeys(pendingBlocks),
    [pendingBlocks],
  );

  // 미니 캘린더의 월 이동과 선택 날짜를 함께 맞춥니다.
  const handleMonthChange = (targetMonthIndex) => {
    const newDate = new Date(year, targetMonthIndex, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  // 차단 모드에서는 빈 슬롯 선택, 일반 모드에서는 일정 상세 모달을 엽니다.
  const clearDragSelection = useCallback(() => {
    setDragSelection(null);
  }, []);

  const startBlockDrag = (date, time, isPast, slotEvents) => {
    if (!isBlockMode || isPast || slotEvents.length > 0) return;
    const slotKey = `${date}_${time}`;
    const existingBlockKeys = pendingBlocks;
    setPendingBlocks((prev) =>
      prev.includes(slotKey) ? prev : [...prev, slotKey],
    );
    setDragSelection({
      mode: "block",
      date,
      startTime: time,
      endTime: time,
      existingBlockKeys,
    });
  };

  const startApprovalDrag = (event, mouseEvent) => {
    if (event.status !== "pending") return;
    if (!approvalFocus) return;
    if (approvalFocus && approvalFocus.event.targetId !== event.targetId)
      return;
    mouseEvent.stopPropagation();

    setDragSelection({
      mode: "approve",
      date: event.date,
      startTime: event.time,
      endTime: event.time,
      event,
      reservation: event.originalData || {},
    });
  };

  const startFocusedApprovalDrag = (date, time, isPast, slotEvents) => {
    if (!approvalFocus || isPast) return;
    if (!canApproveSlot(approvalFocus.reservation, date, time)) return;

    const hasBlockingEvent = slotEvents.some(
      (slotEvent) =>
        slotEvent.type === "block" ||
        (slotEvent.targetId !== approvalFocus.event.targetId &&
          !slotEvent.isExtension),
    );
    if (hasBlockingEvent) return;

    setDragSelection({
      mode: "approve",
      date,
      startTime: time,
      endTime: time,
      event: approvalFocus.event,
      reservation: approvalFocus.reservation,
    });
  };

  const beginRangeApprovalMode = (event) => {
    setApprovalFocus({
      event,
      reservation: event.originalData || {},
    });
    setSelectedDate(getDateFromKey(event.date));
    setModalOpen(false);
  };

  const updateDragSelection = (date, time, isPast, slotEvents) => {
    if (!dragSelection || dragSelection.date !== date) return;

    if (dragSelection.mode === "block") {
      if (isPast || slotEvents.length > 0) return;

      const selectedTimes = times.filter((slotTime) =>
        isTimeInsideRange(slotTime, dragSelection.startTime, time),
      );

      setPendingBlocks([
        ...(dragSelection.existingBlockKeys || []),
        ...selectedTimes.map((slotTime) => `${date}_${slotTime}`),
      ]);
      setDragSelection((prev) => ({ ...prev, endTime: time }));
      return;
    }

    if (dragSelection.mode === "approve") {
      if (
        isPast ||
        !canApproveSlot(dragSelection.reservation, date, time) ||
        slotEvents.some(
          (slotEvent) =>
            slotEvent.type === "block" ||
            (slotEvent.targetId !== dragSelection.event.targetId &&
              !slotEvent.isExtension),
        )
      ) {
        return;
      }

      setDragSelection((prev) => ({ ...prev, endTime: time }));
    }
  };

  const finishDragSelection = useCallback(async () => {
    if (!dragSelection) return;

    const range = getOrderedRange(
      dragSelection.startTime,
      dragSelection.endTime,
    );

    if (dragSelection.mode === "block") {
      const selectedTimes = times.filter((slotTime) =>
        isTimeInsideRange(
          slotTime,
          dragSelection.startTime,
          dragSelection.endTime,
        ),
      );

      setPendingBlocks([
        ...(dragSelection.existingBlockKeys || []),
        ...selectedTimes.map((slotTime) => `${dragSelection.date}_${slotTime}`),
      ]);
    }

    if (dragSelection.mode === "approve") {
      const draft = {
        event: dragSelection.event,
        reservation: dragSelection.reservation,
        date: dragSelection.date,
        startTime: range.startTime,
        endTime: range.endTime,
      };

      try {
        setLoading(true);
        await allowAdminReservation({
          reservationId: draft.event.targetId || draft.event.id,
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
        });

        setApprovalDraft(null);
        setApprovalFocus(null);
        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert(err.message || "상담 승인 처리에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    clearDragSelection();
    setSuppressNextClick(true);
    window.setTimeout(() => setSuppressNextClick(false), 0);
  }, [
    clearDragSelection,
    dragSelection,
    fetchAdminCalendarByCurrentMonth,
    times,
  ]);

  useEffect(() => {
    const handleWindowMouseUp = () => finishDragSelection();
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [finishDragSelection]);

  const handleSlotClick = (dateStr, timeStr, slotEvents, isPast) => {
    if (suppressNextClick) return;
    if (isPast && slotEvents.length === 0) return;
    setSelectedDate(getDateFromKey(dateStr));

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

  // 선택된 여러 30분 슬롯을 서버 차단 요청으로 순차 등록합니다.
  const handleCreateBlock = async () => {
    if (selectedBlockReasons.length === 0)
      return alert(blockCopy.reasonRequired);
    if (selectedBlockRanges.length === 0) return alert(blockCopy.rangeRequired);

    const blockReason = selectedBlockReasons.join(", ");

    try {
      setLoading(true);
      await Promise.all(
        selectedBlockRanges.map((range) =>
          blockAdminReservation({
            selectedDate: range.date,
            startTime: range.startTime,
            endTime: range.endTime,
            field: fieldFilter,
            reason: blockReason,
          }),
        ),
      );

      alert(blockCopy.success);
      setModalOpen(false);
      setIsBlockMode(false);
      setPendingBlocks([]);
      setSelectedBlockReasons([]);
      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      console.error(err);
      alert(err.message || blockCopy.failure);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDraft = async () => {
    if (!approvalDraft) return alert("승인할 시간 범위를 먼저 선택해 주세요.");

    try {
      setLoading(true);
      await allowAdminReservation({
        reservationId: approvalDraft.event.targetId || approvalDraft.event.id,
        date: approvalDraft.date,
        startTime: approvalDraft.startTime,
        endTime: approvalDraft.endTime,
      });

      setApprovalDraft(null);
      setApprovalFocus(null);
      setModalOpen(false);
      await fetchAdminCalendarByCurrentMonth();
    } catch (err) {
      alert(err.message || "상담 승인 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  // 연속 차단으로 병합된 슬롯까지 한 번에 차단 해제합니다.
  const handleUnblock = async (ids) => {
    if (window.confirm("선택한 차단 일정을 해제하시겠습니까?")) {
      try {
        setLoading(true);
        await unblockAdminReservation(ids);
        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert("차단 해제에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (id, status) => {
    const reason = window.prompt(
      "불허/취소 사유를 입력해 주세요. (미입력 가능)",
      "",
    );
    if (reason === null) return;
    if (window.confirm("정말 이 상담 신청을 불허(취소)하시겠습니까?")) {
      try {
        setLoading(true);
        if (status === "approved" || status === "confirmed") {
          await cancelReservation({
            reservationId: id,
            cancelReason: reason.trim(),
          });
        } else {
          await disallowAdminReservation([
            { id, reason: reason.trim() || null },
          ]);
        }
        setModalOpen(false);
        await fetchAdminCalendarByCurrentMonth();
      } catch (err) {
        alert("불허 처리에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const pendingAvailabilityUsers = useMemo(() => {
    const userMap = new Map();

    filteredSchedules.forEach((schedule) => {
      (schedule.reservations || []).forEach((reservation) => {
        if (reservation.status !== "pending") return;

        const dateRanges = (reservation.available_ranges || [])
          .filter((range) => getDateKey(range.date) === selectedDateStr)
          .sort((a, b) =>
            String(a.start_time || "").localeCompare(
              String(b.start_time || ""),
            ),
          );

        if (dateRanges.length === 0) return;

        const key = getReservationKey(reservation);
        const previous = userMap.get(key);
        const color = getReservationColor(key);
        const event = events.find(
          (item) =>
            item.targetId === (reservation.reservation_id || reservation.id),
        );

        userMap.set(key, {
          key,
          color,
          reservation,
          event,
          name: reservation.username || "사용자",
          ranges: [...(previous?.ranges || []), ...dateRanges],
        });
      });
    });

    return Array.from(userMap.values()).map((user) => ({
      ...user,
      ranges: user.ranges
        .sort((a, b) =>
          String(a.start_time || "").localeCompare(String(b.start_time || "")),
        )
        .slice(0, 2),
    }));
  }, [events, filteredSchedules, selectedDateStr]);

  const pendingAvailabilityPaints = useMemo(() => {
    const paints = [];

    filteredSchedules.forEach((schedule) => {
      (schedule.reservations || []).forEach((reservation) => {
        if (reservation.status !== "pending") return;

        const key = getReservationKey(reservation);
        const color = getReservationColor(key);

        (reservation.available_ranges || []).forEach((range) => {
          paints.push({
            key,
            color,
            reservation,
            range,
            event: events.find(
              (item) =>
                item.targetId ===
                (reservation.reservation_id || reservation.id),
            ),
          });
        });
      });
    });

    return paints;
  }, [events, filteredSchedules]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
              {pendingAvailabilityUsers.length > 0 ? (
                pendingAvailabilityUsers.map((user) => (
                  <div
                    key={user.key}
                    className="day-event-item user-availability-item"
                    style={{ "--user-color": user.color }}
                    onClick={() => {
                      const targetId = user.event?.targetId || user.event?.id;
                      const userEvent = events.find(
                        (event) =>
                          targetId &&
                          event.targetId === targetId &&
                          !event.isExtension,
                      );
                      const firstRange = user.ranges[0];
                      const detailEvent = {
                        ...(userEvent || {}),
                        id: userEvent?.id || user.key,
                        targetId: userEvent?.targetId || user.key,
                        type: "reservation",
                        status: userEvent?.status || "pending",
                        title: userEvent?.title || user.name,
                        time: String(
                          firstRange?.start_time || userEvent?.time || "",
                        ).slice(0, 5),
                        endTime: String(
                          firstRange?.end_time || userEvent?.endTime || "",
                        ).slice(0, 5),
                        originalData: user.reservation,
                      };

                      setSelectedSlot({
                        date: selectedDateStr,
                        time:
                          firstRange?.start_time?.slice(0, 5) ||
                          userEvent?.time,
                        allEvents: [detailEvent],
                        modalTitle: "사용자 일정 목록",
                      });
                      setModalType("info");
                      setModalOpen(true);
                    }}
                  >
                    <div className="availability-user-row">
                      <span className="availability-color-dot" />
                      <span className="day-event-title">{user.name}</span>
                    </div>
                    <div className="availability-range-list">
                      {user.ranges.map((range, index) => (
                        <span
                          key={`${user.key}-${range.start_time}-${index}`}
                          className="availability-range-chip"
                        >
                          {getRangeLabel(range)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="day-empty-msg">승인 대기자가 없습니다.</div>
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
              <div className="field-filter-group" aria-label="분야 필터">
                {FIELD_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    className={`field-filter-btn ${fieldFilter === filter.value ? "active" : ""}`}
                    onClick={() =>
                      setFieldFilter((current) =>
                        current === filter.value ? null : filter.value,
                      )
                    }
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
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
                const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const isToday = dStr === todayStr;
                const isSelectedDay = dStr === selectedDateStr;
                return (
                  <div
                    key={d.toISOString()}
                    className={`grid-col-header ${isSelectedDay ? "selected" : ""} ${isToday ? "today" : ""}`}
                    onClick={() => setSelectedDate(new Date(d))}
                  >
                    <span className="day-name">
                      {["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}
                    </span>
                    <span className="day-date">{d.getDate()}</span>
                    {isToday && <span className="today-label">today</span>}
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
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      const slotEvents = events.filter(
                        (e) => e.date === dateStr && e.time === time,
                      );

                      const baseEvents = slotEvents.filter(
                        (e) => !e.isExtension,
                      );
                      const displayEvent = baseEvents[0];
                      const extraCount = baseEvents.length - 1;

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

                      const isBlockable =
                        isBlockMode && slotEvents.length === 0 && !isPast;
                      const slotKey = `${dateStr}_${time}`;
                      const isSelected =
                        pendingBlocks.includes(slotKey) ||
                        isSlotInsideBlockRanges(
                          selectedBlockRanges,
                          dateStr,
                          time,
                        );
                      const isDragBlockSelected =
                        dragSelection?.mode === "block" &&
                        dragSelection.date === dateStr &&
                        isTimeInsideRange(
                          time,
                          dragSelection.startTime,
                          dragSelection.endTime,
                        );
                      const isDragApprovalSelected =
                        dragSelection?.mode === "approve" &&
                        dragSelection.date === dateStr &&
                        isTimeInsideRange(
                          time,
                          dragSelection.startTime,
                          dragSelection.endTime,
                        );
                      const isApprovalRangeable =
                        dragSelection?.mode === "approve" &&
                        dragSelection.date === dateStr &&
                        canApproveSlot(
                          dragSelection.reservation,
                          dateStr,
                          time,
                        );
                      const isApprovalFocusAllowed =
                        approvalFocus &&
                        canApproveSlot(
                          approvalFocus.reservation,
                          dateStr,
                          time,
                        );
                      const isApprovalFocusDimmed =
                        approvalFocus && !isApprovalFocusAllowed;
                      const slotAvailabilityPaints =
                        pendingAvailabilityPaints.filter((paint) =>
                          isRangeSlot(paint.range, dateStr, time),
                        );
                      const hasAvailabilityPaint =
                        slotAvailabilityPaints.length > 0;
                      const availabilityBackground =
                        getDiagonalAvailabilityBackground(
                          slotAvailabilityPaints,
                        );
                      const hasPreviousAvailability =
                        hasAvailabilityPaint &&
                        hasAvailabilityAt(
                          pendingAvailabilityPaints,
                          dateStr,
                          addMinutesToTime(time, -SLOT_MINUTES),
                        );
                      const hasNextAvailability =
                        hasAvailabilityPaint &&
                        hasAvailabilityAt(
                          pendingAvailabilityPaints,
                          dateStr,
                          addMinutesToTime(time, SLOT_MINUTES),
                        );
                        
                      return (
                        <div
                          key={`${dateStr}-${time}`}
                          className={`grid-cell ${isHalfHour ? "half-hour" : ""} ${isBlockable ? "blockable" : ""} ${hasAvailabilityPaint ? "has-availability" : ""} ${isApprovalFocusAllowed ? "approval-focus-allowed" : ""} ${isApprovalFocusDimmed ? "approval-focus-dimmed" : ""} ${isSelected || isDragBlockSelected ? "selected-for-block" : ""} ${isDragApprovalSelected ? "selected-for-approval" : ""} ${isApprovalRangeable ? "approval-rangeable" : ""} ${isPast && !displayEvent ? "past-slot" : ""}`}
                          onMouseDown={() =>
                            approvalFocus
                              ? startFocusedApprovalDrag(
                                  dateStr,
                                  time,
                                  isPast,
                                  slotEvents,
                                )
                              : startBlockDrag(
                                  dateStr,
                                  time,
                                  isPast,
                                  slotEvents,
                                )
                          }
                          onMouseEnter={() =>
                            updateDragSelection(
                              dateStr,
                              time,
                              isPast,
                              slotEvents,
                            )
                          }
                          onClick={() =>
                            handleSlotClick(dateStr, time, slotEvents, isPast)
                          }
                        >
                          {hasAvailabilityPaint && (
                            <div
                              className={`availability-fill ${hasPreviousAvailability ? "connect-prev" : ""} ${hasNextAvailability ? "connect-next" : ""}`}
                              style={{
                                "--availability-bg": availabilityBackground,
                              }}
                            />
                          )}
                          
                          {displayEvent && (
                            <div
                              className={`event-card ${
                                displayEvent.type === "block"
                                  ? "block"
                                  : displayEvent.status
                              } ${isPast ? "past-event" : ""}`}
                              style={{
                                "--event-user-color":
                                  displayEvent.status === "pending"
                                    ? getReservationColor(
                                        getReservationKey(
                                          displayEvent.originalData
                                        )
                                      )
                                    : undefined,

                                top:
                                  displayEvent.type === "block"
                                    ? "0"
                                    : "1px",

                                height:
                                  displayEvent.type === "block"
                                    ? `calc(${displayEvent.slotSpan} * var(--calendar-slot-height))`
                                    : `calc(${displayEvent.slotSpan} * var(--calendar-slot-height) - 2px)`,

                                zIndex: 10 + displayEvent.slotSpan,
                              }}
                              onMouseDown={(mouseEvent) =>
                                startApprovalDrag(displayEvent, mouseEvent)
                              }
                              title={
                                displayEvent.status === "pending"
                                  ? "드래그해서 승인할 시간 범위를 선택"
                                  : undefined
                              }
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
            {approvalFocus ? (
              <div className="block-mode-actions">
                <span className="block-mode-help">
                  선택된 예약의 가능 시간 안에서 승인 범위를 드래그하세요.
                </span>
                <button
                  className="adm-btn secondary"
                  onClick={() => {
                    setApprovalFocus(null);
                    setDragSelection(null);
                  }}
                >
                  범위 지정 취소
                </button>
              </div>
            ) : isBlockMode ? (
              <div className="block-mode-actions">
                <span className="block-mode-help">
                  빈 시간대를 드래그해서 차단 범위를 선택하세요.
                </span>
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
                    if (selectedBlockRanges.length === 0)
                      return alert("차단할 시간대를 먼저 선택해 주세요.");
                    setSelectedBlockReasons([]);
                    setModalType("create-block");
                    setModalOpen(true);
                  }}
                >
                  선택한 {selectedBlockRanges.length}개 구간 차단
                </button>
              </div>
            ) : (
              <button
                className="adm-btn danger"
                onClick={() => setIsBlockMode(true)}
              >
                일정 차단
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
                  {selectedSlot.modalTitle ||
                    (selectedSlot.allEvents.length > 1
                      ? "해당 시간 일정 목록"
                      : selectedSlot.allEvents[0].type === "block"
                        ? "차단 일정 상세"
                        : "예약 상세 정보")}
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
                      {evt.type !== "block" && (
                        <>
                          <p>
                            <strong>이메일:</strong> {evt.originalData.email}
                          </p>
                        </>
                      )}
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
                                onClick={() => beginRangeApprovalMode(evt)}
                              >
                                범위 지정 승인
                              </button>
                            )}
                            {(evt.status === "pending" ||
                              evt.status === "approved" ||
                              evt.status === "confirmed") && (
                              <button
                                className="adm-btn danger"
                                onClick={() =>
                                  handleReject(
                                    evt.targetId || evt.id,
                                    evt.status,
                                  )
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
            ) : modalType === "approve-range" ? (
              <>
                <h3 className="modal-title">상담 시간 확정</h3>
                <div className="modal-content range-confirm">
                  <p>
                    <strong>예약:</strong>{" "}
                    {approvalDraft?.event?.title || "상담 예약"}
                  </p>
                  <p>
                    <strong>확정 시간:</strong> {approvalDraft?.date}{" "}
                    {approvalDraft?.startTime} ~ {approvalDraft?.endTime}
                  </p>
                  <p className="modal-hint">
                    사용자가 제출한 가능 시간 안에서만 선택됩니다.
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    className="adm-btn secondary"
                    onClick={() => {
                      setApprovalDraft(null);
                      setApprovalFocus(null);
                      setModalOpen(false);
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="adm-btn primary"
                    onClick={handleApproveDraft}
                  >
                    확정 승인
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="modal-title">{blockCopy.modalTitle}</h3>
                <div className="modal-content">
                  <div className="block-range-summary">
                    <strong>{blockCopy.selectedRange}</strong>
                    {selectedBlockRanges.map((range) => (
                      <span
                        key={`${range.date}-${range.startTime}-${range.endTime}`}
                        className="block-range-chip"
                      >
                        {range.date} {range.startTime} ~ {range.endTime}
                      </span>
                    ))}
                  </div>
                  <fieldset className="block-reason-fieldset">
                    <legend className="modal-label">
                      {blockCopy.reasonLegend}
                    </legend>
                    <div className="block-reason-options">
                      {BLOCK_REASON_OPTIONS.map((reason) => (
                        <label
                          className="block-reason-option"
                          key={reason.value}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBlockReasons.includes(
                              reason.value,
                            )}
                            onChange={(event) => {
                              setSelectedBlockReasons((current) =>
                                event.target.checked
                                  ? [...current, reason.value]
                                  : current.filter(
                                      (item) => item !== reason.value,
                                    ),
                              );
                            }}
                          />
                          <span>
                            {reason.label[language] || reason.label.ko}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="modal-hint">{blockCopy.multiHint}</p>
                  </fieldset>
                </div>
                <div className="modal-actions">
                  <button
                    className="adm-btn secondary"
                    onClick={() => {
                      setSelectedBlockReasons([]);
                      setModalOpen(false);
                    }}
                  >
                    {blockCopy.cancel}
                  </button>
                  <button
                    className="adm-btn danger"
                    onClick={handleCreateBlock}
                    disabled={selectedBlockReasons.length === 0 || loading}
                  >
                    {blockCopy.submit}
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
