import { getCurrentLanguage, translate } from "../../i18n/translations";
import "../../styles/sonny-selected-home.css";

export default function ExpansionRoadmap() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  const services = [
    {
      icon: "B",
      title: t("home.serviceIncorporation"),
      items: [
        t("home.serviceIncorporation1"),
        t("home.serviceIncorporation2"),
        t("home.serviceIncorporation3"),
      ],
    },
    {
      icon: "V",
      title: t("home.serviceVisa"),
      items: [t("home.serviceVisa1"), t("home.serviceVisa2")],
    },
    {
      icon: "S",
      title: t("home.serviceTax"),
      items: [
        t("home.serviceTax1"),
        t("home.serviceTax2"),
        t("home.serviceTax3"),
        t("home.serviceTax4"),
        t("home.serviceTax5"),
      ],
    },
    {
      icon: "I",
      title: t("home.serviceHr"),
      items: [t("home.serviceHr1"), t("home.serviceHr2"), t("home.serviceHr3")],
    },
    {
      icon: "H",
      title: t("home.serviceAudit"),
      items: [
        t("home.serviceAudit1"),
        t("home.serviceAudit2"),
        t("home.serviceAudit3"),
      ],
    },
    {
      icon: "D",
      title: t("home.serviceDueDiligence"),
      items: [
        t("home.serviceDueDiligence1"),
        t("home.serviceDueDiligence2"),
        t("home.serviceDueDiligence3"),
      ],
    },
  ];

  const steps = [
    {
      no: "1",
      label: "Exploration",
      title: "AI 챗봇 기초 상담",
      desc: "일본 법인 설립, 세무, 노무, 비자에 대한 기초 질문을 먼저 정리합니다.",
    },
    {
      no: "2",
      label: "Preparation",
      title: "히어링 시트 작성",
      desc: "회사명, 사업 목적, 자본금, 발기인과 이사 정보를 입력해 상담 자료를 준비합니다.",
    },
    {
      no: "3",
      label: "Expert Review",
      title: "전문가 상담 예약",
      desc: "정리된 정보를 바탕으로 회계사, 법무 전문가와 더 깊은 상담을 진행합니다.",
    },
    {
      no: "4",
      label: "Execution",
      title: "설립 및 운영 지원",
      desc: "법인 설립 이후 세무 신고, 급여, 사회보험 등 운영 업무로 이어집니다.",
    },
  ];

  return (
    <section id="flow" className="selected-roadmap">
      <div className="container">
        <div className="selected-section-head">
          <p className="selected-kicker">Service Workflow</p>
          <h2 className="section-title">일본 진출 흐름과 WVA 서비스</h2>
          <p className="section-desc">
            사용자는 챗봇으로 기초 정보를 확인하고, 히어링 시트로 상담 자료를
            정리한 뒤, 전문가 상담으로 연결됩니다.
          </p>
        </div>

        <div className="selected-workflow-grid">
          {steps.map((step) => (
            <article className="selected-step-card" key={step.no}>
              <div className="selected-step-number">{step.no}</div>
              <p>{step.label}</p>
              <h3>{step.title}</h3>
              <span>{step.desc}</span>
            </article>
          ))}
        </div>

        <div className="selected-service-grid">
          {services.map((service) => (
            <article className="selected-service-card" key={service.title}>
              <div className="selected-service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <ul>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
