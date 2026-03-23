export default function AdminNotice({ tone = 'info', children }) {
  const className = tone === 'error'
    ? 'admin-inline-error'
    : tone === 'empty'
      ? 'admin-inline-empty'
      : 'admin-inline-info';
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <div className={className} role={role}>
      <span className="admin-notice-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
