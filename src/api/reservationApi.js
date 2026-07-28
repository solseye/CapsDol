import { fetchWithAuth } from "./authFetch";

async function parseJsonResponse(res) {
  return res.json().catch(() => ({}));
}

export async function createReservation({
  phone,
  companyName,
  kind,
  field,
  note = "",
  availableRanges,
}) {

  const requestBody = {
    phone,
    c_name: companyName,
    kind,
    field,
    available_ranges: availableRanges.map((range) => ({
      date: range.date,
      start_time: range.startTime,
      end_time: range.endTime,
    })),
  };

  const trimmedNote = note.trim();

  if (trimmedNote) {
    requestBody.note = trimmedNote;
  }

  const res = await fetchWithAuth(`/reserv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 예약에 실패했습니다.");
  }

  return data;
}

export async function cancelReservation({
  reservationId,
  cancelReason = "",
}) {

  const requestBody = {
    reservationId,
  };

  const trimmedReason = cancelReason.trim();

  if (trimmedReason) {
    requestBody.cancelReason = trimmedReason;
  }

  const res = await fetchWithAuth(`/reserv/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 취소에 실패했습니다.");
  }

  return data;
}

export async function deleteReservation({ reservationId }) {

  const res = await fetchWithAuth(`/reserv/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      reservationId,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 삭제에 실패했습니다.");
  }

  return data;
}

export async function getMyReservations() {

  const res = await fetchWithAuth(`/reserv/user/list`, {
    method: "GET",
    headers: {
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "내 예약 목록 조회에 실패했습니다.");
  }

  return data;
}

export async function getUserReservations({
  uuid,
  limit = 100,
  offset = 0,
} = {}) {

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (uuid?.trim()) {
    params.append("uuid", uuid.trim());
  }

  const res = await fetchWithAuth(`/reserv/user/list?${params.toString()}`, {
    method: "GET",
    headers: {
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "사용자 상담 신청 내역 조회에 실패했습니다.");
  }

  return data;
}

export async function getReservationList() {

  const res = await fetchWithAuth(`/reserv/list`, {
    method: "GET",
    headers: {
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 일정 조회에 실패했습니다.");
  }

  return data;
}

export async function getReservationListByRange({
  baseDate,
  previousMonthCount = 2,
  nextMonthCount = 4,
} = {}) {

  const requestBody = {
    previous_month_count: previousMonthCount,
    next_month_count: nextMonthCount,
  };

  if (baseDate) {
    requestBody.base_date = baseDate;
  }

  const res = await fetchWithAuth(`/reserv/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 일정 조회에 실패했습니다.");
  }

  return data;
}

function normalizeAdminListData(data) {
  const schedulesMap = {};

  (data.reservations || []).forEach((reservation) => {
    const ranges = reservation.available_ranges || [];

    ranges.forEach((range) => {
      const key = `${range.date}_${range.start_time}_${reservation.field}`;

      if (!schedulesMap[key]) {
        schedulesMap[key] = {
          schedule_id: key,
          field: reservation.field,
          selected_date: range.date,
          selected_time: range.start_time,
          reservations: [],
        };
      }

      schedulesMap[key].reservations.push(reservation);
    });
  });

  const schedules = Object.values(schedulesMap);

  const blocks = (data.blocks || []).map((b) => ({
    ...b,
    blocked_date: b.unavailable_date,
    blocked_time: b.start_time,
  }));

  return {
    schedules,
    blocks,
  };
}

export async function getAdminReservationList() {

  const res = await fetchWithAuth(`/reserv/admin/list`, {
    method: "GET",
    headers: {
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "관리자 예약 조회 실패");
  }

  return normalizeAdminListData(data);
}

export async function getAdminReservationListByRange(
  requestTime,
  monthsToFetch
) {

  const body = {
    base_date: requestTime.slice(0, 10),
    previous_month_count: 2,
    next_month_count: 4,
  };

  const res = await fetchWithAuth(`/reserv/admin/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "관리자 일정 조회 실패");
  }

  return normalizeAdminListData(data);
}

export async function blockAdminReservation({
  field,
  selectedDate,
  selectedTime,
  startTime,
  endTime,
  reason,
}) {

  const date = new Date(selectedDate).toISOString().slice(0, 10);

  const start_time = startTime || selectedTime;
  const end_time = endTime || addMinutes(start_time, 120);

  const res = await fetchWithAuth(`/reserv/admin/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      blocks: [
        {
          field,
          date,
          start_time,
          end_time,
          reason,
        },
      ],
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 차단 실패");
  }

  return data;
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);

  const total = h * 60 + m + minutes;

  const hour = Math.floor(total / 60);
  const min = total % 60;

  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export async function unblockAdminReservation(blockId) {

  const res = await fetchWithAuth(`/reserv/admin/unblock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      blockIds: [blockId],
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 차단 해제에 실패했습니다.");
  }

  return data;
}

export async function allowAdminReservation({
  reservationId,
  date,
  startTime,
  endTime,
}) {

  const res = await fetchWithAuth(`/reserv/admin/allow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      reservationId,
      date,
      start_time: startTime,
      end_time: endTime,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 승인 실패");
  }

  return data;
}

export async function disallowAdminReservation(decisions) {

  const res = await fetchWithAuth(`/reserv/admin/disallow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      decisions,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 불허 처리 실패");
  }

  return data;
}

export async function modifyReservation({
  reservationId,
  availableRanges,
}) {

  const res = await fetchWithAuth(`/reserv/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      reservationId,
      available_ranges: availableRanges.map((range) => ({
        date: range.date,
        start_time: range.startTime,
        end_time: range.endTime,
      })),
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 수정에 실패했습니다.");
  }

  return data;
}
