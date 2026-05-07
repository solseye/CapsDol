import { Link } from "react-router-dom";

import InsaIcon from "../../assets/icons/insa.svg";
import LawIcon from "../../assets/icons/law.svg";
import AccountingIcon from "../../assets/icons/accounting.svg";
import LaborIcon from "../../assets/icons/labor.svg";

export default function Hearing() {
  return (
    <>
      {/* Hearing */}
      <br />
      <br />

      <section id="hearing-shortcuts">
        <div className="container">
          <div className="kicker">Hearing Sheet</div>

          <h2 className="section-title">분야별 히어링 시트</h2>

          <p className="section-desc">상담이 필요한 분야를 선택해 주세요</p>

          <div className="hearing-grid">
            {[
              {
                title: "인사",
                desc: "채용 및 인사 운영 관련 상담",
                icon: InsaIcon,
              },
              {
                title: "법무",
                desc: "계약 및 법률 검토 관련 상담",
                icon: LawIcon,
              },
              {
                title: "회계",
                desc: "세무 및 회계 관리 관련 상담",
                icon: AccountingIcon,
              },
              {
                title: "노무",
                desc: "노동 및 급여 관련 상담",
                icon: LaborIcon,
              },
            ].map((item) => (
              <Link
                key={item.title}
                to="/hearing-sheet"
                className="card hearing-shortcut-card"
              >
                <div className="hearing-icon">
                  <img src={item.icon} alt={item.title} />
                </div>

                <h3>{item.title}</h3>

                <p className="muted">{item.desc}</p>

                <span className="hearing-link">히어링 시트 작성 →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
