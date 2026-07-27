import { useState } from "react";
import "../../styles/sonny-selected-home.css";

const guideData = [
  {
    id: "corp",
    label: "현지 법인",
    title: "주식회사(KK) / 합동회사(GK)",
    desc: "일본 내 독립 법인을 세워 현지 거래처 신뢰와 장기 사업 기반을 확보하는 방식입니다.",
    recommend: [
      "일본 시장에서 직접 매출을 만들 계획이 있는 기업",
      "현지 은행 계좌, 계약, 채용이 필요한 기업",
      "설립 이후 세무·노무 관리까지 함께 준비해야 하는 기업",
    ],
    price: "¥300,000 ~",
  },
  {
    id: "branch",
    label: "지점/연락사무소",
    title: "일본 지점 / 연락사무소",
    desc: "한국 본사를 유지하면서 일본 시장 조사 또는 제한적인 현지 활동을 시작하는 방식입니다.",
    recommend: [
      "초기 리스크를 줄이고 일본 시장성을 먼저 검증하려는 기업",
      "본사의 신용과 실적을 활용하고 싶은 기업",
      "현지 법인 설립 전 단계의 진입 전략이 필요한 기업",
    ],
    price: "¥200,000 ~",
  },
  {
    id: "visa",
    label: "비자",
    title: "경영관리 비자 / 취업 비자",
    desc: "대표자와 파견 인력이 일본에서 안정적으로 체류하고 업무를 수행하기 위한 행정 절차입니다.",
    recommend: [
      "대표자가 일본에 체류하며 직접 운영해야 하는 경우",
      "한국 임직원 또는 엔지니어를 일본에 파견하려는 경우",
      "사업계획서와 입국관리국 대응이 필요한 경우",
    ],
    price: "¥150,000 ~",
  },
  {
    id: "tax",
    label: "세무·노무",
    title: "월간 세무·노무 운영 관리",
    desc: "법인 설립 이후 회계 장부, 급여, 사회보험, 신고 일정을 안정적으로 관리하는 영역입니다.",
    recommend: [
      "일본 세법과 노동법을 직접 관리하기 어려운 기업",
      "급여, 사회보험, 소비세, 법인세 신고가 필요한 기업",
      "월별 운영 리포트를 한국어로 확인하고 싶은 경영진",
    ],
    price: "¥50,000 ~ / 월",
  },
];

export default function CategoryGuide() {
  const [activeId, setActiveId] = useState(guideData[0].id);
  const activeData = guideData.find((item) => item.id === activeId);

  return (
    <section id="service" className="selected-guide">
      <div className="container">
        <div className="selected-section-head">
          <p className="selected-kicker">Deep-dive Guide</p>
          <h2 className="section-title">서비스 카테고리 가이드</h2>
          <p className="section-desc">
            일본 진출 방식별 추천 대상과 준비해야 할 항목을 한눈에 확인합니다.
          </p>
        </div>

        <div className="selected-guide-layout">
          <aside className="selected-guide-tabs">
            {guideData.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeId === item.id ? "active" : ""}
                onClick={() => setActiveId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </aside>

          <article className="selected-guide-panel">
            <h3>{activeData.title}</h3>
            <p>{activeData.desc}</p>

            <div className="selected-guide-detail">
              <div>
                <h4>이런 경우에 적합합니다</h4>
                <ul>
                  {activeData.recommend.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="selected-price-box">
                <span>예상 시작 비용</span>
                <strong>{activeData.price}</strong>
                <small>실비 및 상세 범위는 상담 후 확정됩니다.</small>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
