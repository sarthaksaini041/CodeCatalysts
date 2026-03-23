export default function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow = 'Admin',
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        <span className="admin-page-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}
