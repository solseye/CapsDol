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
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("로그인 실패");
  }

  return res.json();
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
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error("회원가입 실패");
  }

  return res.json();
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