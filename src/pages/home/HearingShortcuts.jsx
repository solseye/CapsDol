import { Link } from "react-router-dom";
import InsaIcon from "../../assets/icons/insa.svg";
import LawIcon from "../../assets/icons/law.svg";
import AccountingIcon from "../../assets/icons/accounting.svg";
import LaborIcon from "../../assets/icons/labor.svg";
import { getCurrentLanguage, translate } from "../../i18n/translations";
import "../../styles/sonny-selected-home.css";

export default function HearingShortcuts() {
  const language = getCurrentLanguage();
  const t = (key) => translate(language, key);

  const shortcuts = [
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
  ];

  return (
    <section id="hearing" className="selected-hearing">
      <div className="container">
        <div className="selected-section-head">
          <p className="selected-kicker">Automated Briefing</p>
          <h2 className="section-title">{t("home.hearingShortcutsTitle")}</h2>
          <p className="section-desc">{t("home.hearingShortcutsDesc")}</p>
        </div>

        <div className="selected-hearing-grid">
          {shortcuts.map((item) => (
            <Link
              key={item.title}
              to="/hearing-sheet"
              className="selected-hearing-card"
            >
              <div className="selected-hearing-icon">
                <img src={item.icon} alt="" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span>{t("home.writeHearingSheet")}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
