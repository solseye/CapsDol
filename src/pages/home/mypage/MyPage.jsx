import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import "../../../App.css";
import "../../admin/admin.css";

export default function MyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <main className="reserve-page mypage mypage-main-page">
        <section className="reserve-hero">
          <p className="adm-eyebrow">My Page</p>
          <h2>마이페이지</h2>
          <span>상담 예약 내역과 제출 파일을 관리합니다.</span>
        </section>

        <section className="mypage-menu-grid">
          <article className="adm-card mypage-menu-card">

            <div className="mypage-menu-content">
              <p className="adm-eyebrow">Reservations</p>
              <h2>내 상담 내역</h2>

              <p>
                신청한 상담 예약의 승인 상태와 일정을 확인하고,
                필요한 경우 예약을 취소하거나 내역을 삭제할 수
                있습니다.
              </p>
            </div>

            <Link
              to="/mypage/reservations"
              className="adm-btn primary"
            >
              상담 내역 보기
            </Link>
          </article>

          <article className="adm-card mypage-menu-card">

            <div className="mypage-menu-content">
              <p className="adm-eyebrow">My Files</p>
              <h2>내 파일 관리</h2>

              <p>
                상담에 필요한 자료를 업로드하고, 제출한 파일의
                이름과 설명 및 업로드 날짜를 확인할 수 있습니다.
              </p>
            </div>

            <Link
              to="/mypage/files"
              className="adm-btn primary"
            >
              파일 관리하기
            </Link>
          </article>
        </section>

        <div className="mypage-home-actions">
          <Link to="/" className="adm-btn ghost">
            홈으로
          </Link>
        </div>
      </main>
    </>
  );
}