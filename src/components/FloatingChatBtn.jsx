import { Link } from "react-router-dom";
import "../styles/sonny-selected-home.css";
import { getCurrentLanguage, translate } from "../i18n/translations";

export default function FloatingChatBtn() {
  const language = getCurrentLanguage();

  return (
    <Link
      to="/chat"
      className="selected-floating-chat"
      aria-label={translate(language, "common.floatingChat")}
    >
      <span className="selected-floating-pulse" aria-hidden="true" />
      <span className="selected-floating-icon" aria-hidden="true">
        ◌
      </span>
      <span>{translate(language, "common.aiChat")}</span>
    </Link>
  );
}
