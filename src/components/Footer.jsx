import { useMemo } from "react";

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer>
      <div className="container footer-grid">
        <div className="muted footer-left">
          <b className="footer-brand">WVA</b>
          <br />
          일본 진출을 쉽게 설명하고 실행을 돕습니다.
        </div>

        <div className="muted footer-right">
          © {year} WVA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}