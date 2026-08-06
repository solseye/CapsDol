import { logoutUser } from "../api/authApi";
import { clearSession } from "./authSession";

// 서버 세션과 로컬 세션을 차례로 정리하고 메인 페이지로 되돌립니다.
// navigate 대신 location.replace를 쓰는 이유는 두 가지입니다.
// 1) 전체 리로드로 헤더/홈이 들고 있던 로그인 상태값이 초기화됩니다.
// 2) history를 대체하므로 뒤로가기로 로그인 화면에 돌아갈 수 없습니다.
export async function logoutAndGoHome() {
  try {
    await logoutUser();
  } catch (err) {
    console.error("로그아웃 실패:", err);
  } finally {
    clearSession();
    window.location.replace("/");
  }
}
