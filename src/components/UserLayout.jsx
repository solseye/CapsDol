import { Outlet } from "react-router-dom";
import Header from "./Header";

// 사용자 업무 화면의 공통 헤더를 한 곳에서 제공합니다.
export default function UserLayout() {
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <Outlet />
    </>
  );
}
