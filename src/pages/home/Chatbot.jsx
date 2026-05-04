import { Link } from "react-router-dom";

export default function ChatFab() {
  return (
    <div className="chat-fab">
      <Link to="/chat" className="btn btnchat primary nav-cta">
        상담 (챗봇)
      </Link>
    </div>
  );
}
