import { Link } from "react-router-dom";

import InsaIcon from "../../assets/icons/insa.svg";
import LawIcon from "../../assets/icons/law.svg";
import AccountingIcon from "../../assets/icons/accounting.svg";
import LaborIcon from "../../assets/icons/labor.svg";

export default function ServiceInfo() {
  return (
    <>
      {/* Service */}
      <section id="service">
        <div className="container">
          <div className="kicker">Services</div>
          <h2 className="section-title">서비스</h2>

          <div className="grid3">
            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  B
                </div>
                <h3>법인 설립</h3>
              </div>
              <ul className="list">
                <li>법인 설립 컨설팅</li>
                <li>정관 작성 및 인증</li>
                <li>법인 인감 제작</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  V
                </div>
                <h3>비자 발행</h3>
              </div>
              <ul className="list">
                <li>취업 비자</li>
                <li>경영 관리 비자</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  G
                </div>
                <h3>계좌 개설</h3>
              </div>
              <ul className="list">
                <li>한국계 은행과의 중개</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  S
                </div>
                <h3>세무 · 회계</h3>
              </div>
              <ul className="list">
                <li>기장 및 재무보고</li>
                <li>세무 신고 (법인·소득·소비)</li>
                <li>세무 컨설팅 및 스킴 설계</li>
                <li>국제조세 (PE 판정, 조세조약)</li>
                <li>세무조사 동행</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  I
                </div>
                <h3>인사 · 노무</h3>
              </div>
              <ul className="list">
                <li>급여 계산</li>
                <li>사회보험 가입 절차</li>
                <li>노동보험 가입 절차</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  B
                </div>
                <h3>부동산 중개</h3>
              </div>
              <ul className="list">
                <li>부동산 관련 업체 중개</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  H
                </div>
                <h3>회계 · 감사</h3>
              </div>
              <ul className="list">
                <li>임의 감사</li>
                <li>회사법 감사</li>
                <li>일본 자회사의 PKG 감사</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* hearing sheet */}
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
