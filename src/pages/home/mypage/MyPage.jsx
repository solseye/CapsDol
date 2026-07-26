import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import "../../../App.css";
import "../../admin/admin.css";

export default function MyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [openGuide, setOpenGuide] = useState("reservation");
  const [checkedSteps, setCheckedSteps] = useState({
    consult: true,
    strategy: true,
    files: false,
    review: false,
    meeting: false,
  });

  const toggleStep = (stepId) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />

      <main className="reserve-page mypage mypage-main-page">
        <section className="mypage-overview-hero">
          <div className="mypage-overview-copy">
            <p className="adm-eyebrow">My Page</p>
            <h1>마이페이지</h1>
            <p>
              귀하의 일본 진출 현황과 프로젝트 일정을 확인하세요.
              상담 예약, 제출 파일, 전문가 검토 준비를 한 곳에서 관리합니다.
            </p>
          </div>
        </section>

        <section className="mypage-primary-grid mypage-compact-actions">
          <div className="mypage-menu-grid">
            <article className="mypage-menu-card mypage-menu-card-reservation">
              <div className="mypage-menu-content">
                <div className="mypage-card-kicker">
                  <span className="mypage-card-icon">CAL</span>
                  <p className="adm-eyebrow">Reservations</p>
                </div>

                <h2>내 상담 내역</h2>

                <p>
                  신청한 상담 예약의 승인 상태와 일정을 확인하고 관리할 수
                  있습니다.
                </p>
              </div>

              <div className="mypage-card-bottom">
                <Link
                  to="/mypage/reservations"
                  className="adm-btn ghost"
                >
                  상담 내역 보기
                </Link>
                <span>01</span>
              </div>
            </article>

            <article className="mypage-menu-card mypage-menu-card-files">
              <div className="mypage-menu-content">
                <div className="mypage-card-kicker">
                  <span className="mypage-card-icon">DOC</span>
                  <p className="adm-eyebrow">Resources</p>
                </div>

                <h2>내 파일 관리</h2>

                <p>
                  상담에 필요한 자료를 업로드하고 제출 이력을 확인할 수
                  있습니다.
                </p>
              </div>

              <div className="mypage-card-bottom">
                <Link
                  to="/mypage/files"
                  className="adm-btn primary"
                >
                  파일 관리하기
                </Link>
                <span>02</span>
              </div>
            </article>
          </div>

        </section>

        <section className="mypage-progress-panel mypage-floating-progress">
            <div className="mypage-section-head">
              <p className="adm-eyebrow">Progress</p>
              <h2>진행 현황</h2>
            </div>
            <div className="mypage-progress-summary">
              <strong>
                {
                  Object.values(checkedSteps).filter(Boolean).length
                }
                /5
              </strong>
              <span>현재 단계: 상담 자료 준비</span>
            </div>

            <div className="mypage-progress-checklist" aria-label="진행 체크리스트">
              {[
                ["consult", "초기 상담 완료"],
                ["strategy", "전략 정리 완료"],
                ["files", "자료 준비 중"],
                ["review", "전문가 검토 대기"],
                ["meeting", "상담 진행 예정"],
              ].map(([id, label]) => (
                <label
                  className={checkedSteps[id] ? "complete" : ""}
                  key={id}
                >
                  <input
                    checked={checkedSteps[id]}
                    onChange={() => toggleStep(id)}
                    type="checkbox"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
        </section>

        <section className="mypage-dashboard-grid">
          <aside className="mypage-help-panel">
            <div className="mypage-section-head">
              <p className="adm-eyebrow">Support</p>
              <h2>도움말 및 안내</h2>
            </div>

            {[
              {
                id: "reservation",
                title: "상담 예약 변경 안내",
                label: "GUIDE",
                body: "상담 시작 전까지 마이페이지에서 일정을 확인하고, 필요한 경우 상담 예약 페이지에서 새 일정을 다시 신청할 수 있습니다.",
                to: "/reservation",
              },
              {
                id: "files",
                title: "파일 업로드 및 제출 자료 안내",
                label: "INFO",
                body: "전문가 검토에 필요한 자료는 PDF, 이미지, 문서 형식으로 정리해 업로드하면 상담 준비 과정에서 함께 확인할 수 있습니다.",
                to: "/mypage/files",
              },
              {
                id: "checklist",
                title: "필수 제출 서류 체크리스트",
                label: "CHECK",
                body: "회사명, 사업 목적, 자본금, 발기인 및 이사 정보처럼 정관 초안과 상담에 필요한 기본 정보를 먼저 정리해 주세요.",
                to: "/hearing-sheet",
              },
            ].map((guide) => (
              <article
                className={`mypage-guide-item ${
                  openGuide === guide.id ? "active" : ""
                }`}
                key={guide.id}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGuide(openGuide === guide.id ? "" : guide.id)
                  }
                >
                  <span>
                    <small>{guide.label}</small>
                    {guide.title}
                  </span>
                  <strong>⌄</strong>
                </button>
                <div className="mypage-guide-body">
                  <p>{guide.body}</p>
                  <Link to={guide.to}>바로 이동</Link>
                </div>
              </article>
            ))}
          </aside>
        </section>

      </main>
    </>
  );
}
