import { Link } from "react-router-dom";

export default function Header() {

  return (
    <header>
      <div className="container nav">
        <Link to="/" className="brand">
          <span className="logo" aria-hidden="true" />
          <span>WVA</span>
        </Link>

        <nav aria-label="주요 메뉴">
          <ul>
            <li><a href="#service">서비스</a></li>
            <li><a href="#about">회사 개요</a></li>
            <li><a href="#flow">업무 흐름</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li>
              <Link to="/chat" className="btn primary nav-cta">
                상담 신청 (챗봇)
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}