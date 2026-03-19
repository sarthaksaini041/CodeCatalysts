export default function AdminField({
  label,
  htmlFor,
  description,
  error,
  children,
}) {
  return (
    <div className="admin-field">
      <label htmlFor={htmlFor}>{label}</label>
      {description ? <div className="admin-field-copy">{description}</div> : null}
      {children}
      {error ? <div className="admin-field-error">{error}</div> : null}
    </div>
  );
}
