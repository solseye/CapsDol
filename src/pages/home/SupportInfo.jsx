import { getCurrentLanguage, translate } from "../../i18n/translations";
import "../../styles/sonny-selected-home.css";

export default function SupportInfo() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  // 변경 이유: sonny 브랜치의 전문가 소개 디자인처럼 경력과 전문 분야를 더 읽기 쉬운 프로필 형태로 보여주기 위함입니다.
  // 기존 번역 키와 전문가 정보는 그대로 사용하고, 화면 구조만 정리했습니다.
  const experts = [
    {
      initial: "K",
      name: t("home.expert1Name"),
      role: t("home.expert1Role"),
      careers: [
        t("home.expert1Career1"),
        t("home.expert1Career2"),
        t("home.expert1Career3"),
        t("home.expert1Career4"),
        t("home.expert1Career5"),
        t("home.expert1Career6"),
      ],
      specialties: [
        t("home.expert1Specialty1"),
        t("home.expert1Specialty2"),
        t("home.expert1Specialty3"),
        t("home.expert1Specialty4"),
        t("home.expert1Specialty5"),
        t("home.expert1Specialty6"),
        t("home.expert1Specialty7"),
      ],
    },
    {
      initial: "G",
      name: t("home.expert2Name"),
      role: t("home.expert2Role"),
      careers: [
        t("home.expert2Career2"),
        t("home.expert2Career3"),
        t("home.expert2Career4"),
        t("home.expert2Career5"),
        t("home.expert2Career6"),
      ],
      specialties: [
        t("home.expert2Specialty1"),
        t("home.expert2Specialty2"),
        t("home.expert2Specialty3"),
        t("home.expert2Specialty4"),
        t("home.expert2Specialty5"),
        t("home.expert2Specialty6"),
      ],
    },
  ];

  return (
    <section id="expert" className="selected-support">
      <div className="container">
        <div className="selected-section-head">
          <div className="selected-kicker">Expert Info</div>
          <h2 className="section-title">{t("home.expertTitle")}</h2>
          <p className="section-desc">
            일본 현지 법인 설립, 세무, 비자, 등기 실무를 전문가 상담으로
            연결합니다.
          </p>
        </div>

        <div className="selected-expert-grid">
          {experts.map((expert) => (
            <article className="selected-expert-card" key={expert.name}>
              <div className="selected-expert-avatar" aria-hidden="true">
                {expert.initial}
              </div>

              <div className="selected-expert-content">
                <div className="selected-expert-title">
                  <h3>{expert.name}</h3>
                  <p>{expert.role}</p>
                </div>

                <div className="selected-expert-details">
                  <div>
                    <p className="selected-expert-label">{t("home.career")}</p>
                    <ul className="selected-expert-careers">
                      {expert.careers.map((career) => (
                        <li key={career}>{career}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="selected-expert-label">
                      {t("home.specialty")}
                    </p>
                    <div className="selected-expert-tags">
                      {expert.specialties.map((specialty) => (
                        <span key={specialty}>{specialty}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <h3 className="selected-expert-closing">{t("home.expertClosing")}</h3>
      </div>
    </section>
  );
}
