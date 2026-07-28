export const MONTHS_TO_FETCH = 7;

// 선택한 날짜가 속한 주의 일요일부터 토요일까지를 만듭니다.
export function getWeekDays(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// 관리자 주간 캘린더에서 사용하는 30분 단위 시간 슬롯입니다.
export function getDayTimeSlots() {
  return Array.from({ length: 18 }, (_, i) => {
    const hour = String(Math.floor(i / 2) + 9).padStart(2, "0");
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  });
}

// 서버에서 받은 날짜 값을 캘린더 비교용 yyyy-mm-dd 키로 정규화합니다.
export function getDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// HH:mm 문자열에 분 단위 길이를 더해 종료 시간을 계산합니다.
export function addMinutesToTime(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m + mins;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function timeToMinutes(timeValue) {
  const [hour, minute] = String(timeValue || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function getSlotSpan(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.max(1, Math.ceil((end - start) / 30));
}

// 예약 분야 코드를 관리자 화면 라벨로 바꿉니다.
export function getFieldLabel(field) {
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

// 선택 날짜가 해당 월의 몇 번째 주에 속하는지 계산합니다.
export function getWeekInfo(dateObj) {
  const target = new Date(dateObj);
  const day = target.getDay();
  const diff = 3 - day;
  target.setDate(target.getDate() + diff);

  return {
    displayYear: target.getFullYear(),
    displayMonth: target.getMonth(),
    displayWeek: Math.floor((target.getDate() - 1) / 7) + 1,
  };
}

// 예약 목록과 차단 목록을 주간 캘린더가 바로 그릴 수 있는 이벤트 배열로 합칩니다.
export function buildAdminCalendarEvents({ schedules = [], blocks = [] }) {
  const newEvents = [];

  // 연속된 차단 슬롯은 첫 슬롯에 병합 정보를 쌓아 한 덩어리처럼 보여줍니다.
  const parsedBlocks = blocks
    .map((b) => ({
      id: b.id || b.block_id,
      targetId: b.id || b.block_id,
      type: "block",
      title: "일정 차단",
      date: getDateKey(b.blocked_date),
      time: String(b.blocked_time || "").slice(0, 5),
      endTime: String(b.end_time || "").slice(0, 5),
      reason: b.reason || "관리자 차단",
      field: b.field,
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
      b.endTime = b.endTime || addMinutesToTime(b.time, 30);
      b.slotSpan = getSlotSpan(b.time, b.endTime);
      b.isExtension = false;
      b.mergedIds = [b.targetId];

      lastBaseBlock = b;
      newEvents.push(b);

      for (let slotIndex = 1; slotIndex < b.slotSpan; slotIndex += 1) {
        const slotTime = addMinutesToTime(b.time, slotIndex * 30);
        newEvents.push({
          ...b,
          id: `${b.id}_ext_${slotIndex}`,
          time: slotTime,
          isExtension: true,
          slotSpan: 1,
        });
      }
    }
  });

  // 예약은 승인 상태에 따라 실제 상담 길이만큼 확장 슬롯을 추가합니다.
  schedules.forEach((schedule) => {
    const dKey = getDateKey(schedule.selected_date);
    const tKey = String(schedule.selected_time || "").slice(0, 5);
    if (!dKey || !tKey) return;

    (schedule.reservations || []).forEach((res) => {
      const status = String(res.status || "").toLowerCase();
      if (["rejected", "cancelled", "canceled"].includes(status)) return;

      const resId = res.reservation_id || res.id;
      const isConfirmed =
        status === "approved" || status === "confirmed";

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
          status: status || res.status,
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
            status: status || res.status,
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
          status: status || res.status,
          field: schedule.field,
          isExtension: false,
          originalData: res,
        });
      }
    });
  });

  return newEvents;
}
