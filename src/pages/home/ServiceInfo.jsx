import { Link } from "react-router-dom";

import InsaIcon from "../../assets/icons/insa.svg";
import LawIcon from "../../assets/icons/law.svg";
import AccountingIcon from "../../assets/icons/accounting.svg";
import LaborIcon from "../../assets/icons/labor.svg";
import { getCurrentLanguage, translate } from "../../i18n/translations";

export default function ServiceInfo() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  return (
    <>
      {/* Service */}
      <section id="service">
        <div className="container">
          <div className="kicker">Services</div>
          <h2 className="section-title">{t("home.servicesTitle")}</h2>

          <div className="grid3">
            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  B
                </div>
                <h3>{t("home.serviceIncorporation")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceIncorporation1")}</li>
                <li>{t("home.serviceIncorporation2")}</li>
                <li>{t("home.serviceIncorporation3")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  V
                </div>
                <h3>{t("home.serviceVisa")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceVisa1")}</li>
                <li>{t("home.serviceVisa2")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  S
                </div>
                <h3>{t("home.serviceTax")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceTax1")}</li>
                <li>{t("home.serviceTax2")}</li>
                <li>{t("home.serviceTax3")}</li>
                <li>{t("home.serviceTax4")}</li>
                <li>{t("home.serviceTax5")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  I
                </div>
                <h3>{t("home.serviceHr")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceHr1")}</li>
                <li>{t("home.serviceHr2")}</li>
                <li>{t("home.serviceHr3")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  H
                </div>
                <h3>{t("home.serviceAudit")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceAudit1")}</li>
                <li>{t("home.serviceAudit2")}</li>
                <li>{t("home.serviceAudit3")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  ?
                </div>
                <h3>{t("home.serviceDueDiligence")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceDueDiligence1")}</li>
                <li>{t("home.serviceDueDiligence2")}</li>
                <li>{t("home.serviceDueDiligence3")}</li>
                <li>{t("home.serviceDueDiligence4")}</li>
                <li>{t("home.serviceDueDiligence5")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  G
                </div>
                <h3>{t("home.serviceBank")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceBank1")}</li>
              </ul>
            </div>

            <div className="card">
              <div className="service-head">
                <div className="avatar" aria-hidden="true">
                  B
                </div>
                <h3>{t("home.serviceRealEstate")}</h3>
              </div>
              <ul className="list">
                <li>{t("home.serviceRealEstate1")}</li>
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
          <h2 className="section-title">{t("home.hearingShortcutsTitle")}</h2>
          <p className="section-desc">{t("home.hearingShortcutsDesc")}</p>

          <div className="hearing-grid">
            {[
              {
                title: t("home.shortcutHrTitle"),
                desc: t("home.shortcutHrDesc"),
                icon: InsaIcon,
              },
              {
                title: t("home.shortcutLawTitle"),
                desc: t("home.shortcutLawDesc"),
                icon: LawIcon,
              },
              {
                title: t("home.shortcutAccountingTitle"),
                desc: t("home.shortcutAccountingDesc"),
                icon: AccountingIcon,
              },
              {
                title: t("home.shortcutLaborTitle"),
                desc: t("home.shortcutLaborDesc"),
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
                <span className="hearing-link">{t("home.writeHearingSheet")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
