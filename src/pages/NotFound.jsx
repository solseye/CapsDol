import { Link } from "react-router-dom";
import "../styles/not-found.css";

export default function NotFound() {
  return (
    <>
      <main className="not-found-page">
        <p>404</p>
        <h1>요청한 페이지를 찾을 수 없습니다.</h1>
        <span>주소를 다시 확인하거나 아래 메뉴에서 이동해 주세요.</span>
        <div>
          <Link to="/">홈으로 가기</Link>
          <Link to="/mypage">마이페이지</Link>
        </div>
      </main>
    </>
  );
}
