import { useMemo } from "react";

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer>
      <div className="container footer-grid">
        <div className="muted footer-left">
          <b className="footer-brand">Kim Myung-Koo CPA · Kanemura</b>
          <br />
          일본 진출 원스톱 지원 · 법인설립/등기/비자/세무·회계/노무
        </div>

        <div className="muted footer-right">
          © {year} Japan Expansion Desk
        </div>
      </div>
    </footer>
  );
}