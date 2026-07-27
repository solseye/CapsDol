import { Link } from "react-router-dom";
import "../styles/sonny-selected-home.css";

export default function FloatingChatBtn() {
  return (
    <Link
      to="/chat"
      className="selected-floating-chat"
      aria-label="AI 상담 챗봇으로 이동"
    >
      <span className="selected-floating-pulse" aria-hidden="true" />
      <span className="selected-floating-icon" aria-hidden="true">
        ◌
      </span>
      <span>AI 상담</span>
    </Link>
  );
}
