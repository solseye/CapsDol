import { Link } from "react-router-dom";
import logo from "../assets/mk-office-logo-transparent.png";

export function BrandMark({ className = "", alt = "" }) {
  return (
    <span className={className} aria-hidden={alt ? undefined : "true"}>
      <img src={logo} alt={alt} />
    </span>
  );
}

export default function BrandLogo({
  as = "link",
  to = "/",
  className = "",
  markClassName = "brand-logo-mark",
  copyClassName = "brand-logo-copy",
  name = "M&K 사무소",
  subtitle = "일본 진출 운영 시스템",
  hideSubtitle = false,
  ariaLabel,
  onClick,
}) {
  const content = (
    <>
      <BrandMark className={markClassName} />
      <span className={copyClassName}>
        <strong>{name}</strong>
        {!hideSubtitle && subtitle && <small>{subtitle}</small>}
      </span>
    </>
  );

  if (as === "button") {
    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
