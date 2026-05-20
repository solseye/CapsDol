const BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

async function parseJsonResponse(res) {
  return res.json().catch(() => ({}));
}

export async function createReservation({
  phone,
  CName,
  kind,
  field,
  selectedDate,
  selectedTime,
}) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      phone,
      CName,
      kind,
      field,
      selectedDate,
      selectedTime,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 예약에 실패했습니다.");
  }

  return data;
}

export async function cancelReservation(reservationId, cancelReason = "") {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      reservationId,
      cancelReason,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 취소에 실패했습니다.");
  }

  return data;
}

export async function getMyReservations() {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/user_list`, {
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

export async function getReservationListByRange(requestTime, monthsToFetch) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      requestTime,
      monthsToFetch,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 일정 조회에 실패했습니다.");
  }

  return data;
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
    throw new Error(data.error || "관리자 예약 목록 조회에 실패했습니다.");
  }

  return data;
}

export async function getAdminReservationListByRange(requestTime, monthsToFetch) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      requestTime,
      monthsToFetch,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "관리자 예약 일정 조회에 실패했습니다.");
  }

  return data;
}

export async function blockAdminReservation({
  field,
  selectedDate,
  selectedTime,
  reason,
}) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      field,
      selectedDate,
      selectedTime,
      reason,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 차단에 실패했습니다.");
  }

  return data;
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
      blockId,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "예약 차단 해제에 실패했습니다.");
  }

  return data;
}

export async function allowAdminReservation(decisions) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/reserv/admin/allow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(decisions),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 승인 처리에 실패했습니다.");
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
    body: JSON.stringify(decisions),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || "상담 불허 처리에 실패했습니다.");
  }

  return data;
}