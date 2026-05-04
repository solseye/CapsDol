export default function AdminButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <button className={`adm-btn ${variant} ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}
