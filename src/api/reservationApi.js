const BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

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
  const token = localStorage.getItem("accessToken");

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

  const res = await fetch(`${BASE_URL}/reserv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const requestBody = {
    reservationId,
  };

  const trimmedReason = cancelReason.trim();

  if (trimmedReason) {
    requestBody.cancelReason = trimmedReason;
  }

  const res = await fetch(`${BASE_URL}/reserv/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/user/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "내 예약 목록 조회에 실패했습니다.");
  }

  return data;
}

export async function getReservationList() {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const requestBody = {
    previous_month_count: previousMonthCount,
    next_month_count: nextMonthCount,
  };

  if (baseDate) {
    requestBody.base_date = baseDate;
  }

  const res = await fetch(`${BASE_URL}/reserv/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const body = {
    base_date: requestTime.slice(0, 10),
    previous_month_count: 2,
    next_month_count: 4,
  };

  const res = await fetch(`${BASE_URL}/reserv/admin/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  reason,
}) {
  const token = localStorage.getItem("accessToken");

  const date = new Date(selectedDate).toISOString().slice(0, 10);

  const start_time = selectedTime;
  const end_time = addMinutes(selectedTime, 120);

  const res = await fetch(`${BASE_URL}/reserv/admin/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/unblock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/allow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/disallow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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