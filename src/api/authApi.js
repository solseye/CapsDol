export async function sendQuestion(question) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error("서버 오류");
  }

  return res.json();
}

export async function loginUser(username, password) {
  const res = await fetch("http://localhost:5000/login", {
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.msg || "로그인 실패");
  }

  return data;
}

export async function loginWithGoogle(idToken) {
  const res = await fetch("http://localhost:5000/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      token: idToken,
    }),
  });

  if (!res.ok) {
    throw new Error("구글 로그인 실패");
  }

  return res.json();
}

export async function signupUser(email, username, password) {
  const res = await fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      uid: username,
      username: username,
      email,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.msg || "회원가입 실패");
  }

  return data;
}

export async function logoutUser() {
  const res = await fetch("http://localhost:5000/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "로그아웃 실패");
  }

  return data;
}

export async function findId(email) {
  const res = await fetch("http://localhost:5000/find_id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "아이디 찾기에 실패했습니다.");
  }

  return data;
}

export async function findPassword(uid) {
  const res = await fetch("http://localhost:5000/find_password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ uid }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "비밀번호 찾기 요청에 실패했습니다.");
  }

  return data;
}

export async function verifyResetToken(token) {
  const res = await fetch("http://localhost:5000/verify_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.msg || "유효하지 않은 토큰입니다.");
  }

  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch("http://localhost:5000/reset_password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.msg || "비밀번호 변경에 실패했습니다.");
  }

  return data;
}