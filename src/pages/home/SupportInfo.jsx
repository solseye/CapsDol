import { getCurrentLanguage, translate } from "../../i18n/translations";

export default function SupportInfo() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  return (
    <>
      {/* Expert Info */}
      <section id="expert">
        <div className="container">
          <div className="kicker">Expert Info</div>

          <h2 className="section-title">{t("home.expertTitle")}</h2>

          <div className="grid2">
            <div className="card expert-card">
              <div className="expert-head">
                <div className="avatar" aria-hidden="true">
                  K
                </div>
                <h3>{t("home.expert1Name")}</h3>
              </div>

              <p className="head">{t("home.expert1Role")}</p>
              <ul className="list">
                <p className="muted m0">{t("home.career")}</p>
                <li>{t("home.expert1Career1")}</li>
                <li>{t("home.expert1Career2")}</li>
                <li>{t("home.expert1Career3")}</li>
                <li>{t("home.expert1Career4")}</li>
                <li>{t("home.expert1Career5")}</li>
                <li>{t("home.expert1Career6")}</li>
              </ul>
              <ul className="list">
                <p className="muted m0">{t("home.specialty")}</p>
                <li>{t("home.expert1Specialty1")}</li>
                <li>{t("home.expert1Specialty2")}</li>
                <li>{t("home.expert1Specialty3")}</li>
                <li>{t("home.expert1Specialty4")}</li>
                <li>{t("home.expert1Specialty5")}</li>
                <li>{t("home.expert1Specialty6")}</li>
                <li>{t("home.expert1Specialty7")}</li>
              </ul>
            </div>

            <div className="card expert-card">
              <div className="expert-head">
                <div className="avatar" aria-hidden="true">
                  G
                </div>
                <h3>{t("home.expert2Name")}</h3>
              </div>

              <p className="head">{t("home.expert2Role")}</p>
              <ul className="list">
                <p className="muted m0">{t("home.career")}</p>
                <li>{t("home.expert2Career1")}</li>
                <li>{t("home.expert2Career2")}</li>
                <li>{t("home.expert2Career3")}</li>
                <li>{t("home.expert2Career4")}</li>
                <li>{t("home.expert2Career5")}</li>
                <li>{t("home.expert2Career6")}</li>
                <br></br>
              </ul>
              <ul className="list">
                <p className="muted m0">{t("home.specialty")}</p>
                <li>{t("home.expert2Specialty1")}</li>
                <li>{t("home.expert2Specialty2")}</li>
                <li>{t("home.expert2Specialty3")}</li>
                <li>{t("home.expert2Specialty4")}</li>
                <li>{t("home.expert2Specialty5")}</li>
              </ul>
            </div>
          </div>
          <h3 className="kicker">{t("home.expertClosing")}</h3>
        </div>
      </section>
    </>
  );
}
