export async function sendQuestion(question) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("서버 오류");
  }

  return res.json();
}