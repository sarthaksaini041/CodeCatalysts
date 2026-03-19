export default function AdminPageHeader({ title, description, actions }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions ? <div className="admin-topbar-actions">{actions}</div> : null}
    </header>
  );
}
