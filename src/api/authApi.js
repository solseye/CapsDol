const BASE_URL =
  process.env.REACT_APP_API_BASE_URL

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  return data;
}

export async function sendQuestion(question) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ question }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "서버 오류");
  }

  return data;
}

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      uid: username,
      password,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "로그인 실패");
  }

  return data;
}

export async function loginWithGoogle(idToken) {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      token: idToken,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "구글 로그인 실패");
  }

  return data;
}

export async function signupUser(email, userId, name, password) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      uid: userId,
      username: name,
      email,
      password,
    }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "회원가입 실패");
  }

  return data;
}

export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "로그아웃 실패");
  }

  return data;
}

export async function findId(email) {
  const res = await fetch(`${BASE_URL}/find_id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "아이디 찾기에 실패했습니다.");
  }

  return data;
}

export async function findPassword(uid) {
  const res = await fetch(`${BASE_URL}/find_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ uid }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "비밀번호 찾기 요청에 실패했습니다.");
  }

  return data;
}

export async function verifyResetToken(token) {
  const res = await fetch(`${BASE_URL}/verify_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "유효하지 않은 토큰입니다.");
  }

  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${BASE_URL}/reset_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.msg || "비밀번호 변경에 실패했습니다.");
  }

  return data;
}
