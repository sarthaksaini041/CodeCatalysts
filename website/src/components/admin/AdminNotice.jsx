export default function AdminNotice({ tone = 'info', children }) {
  const className = tone === 'error'
    ? 'admin-inline-error'
    : tone === 'empty'
      ? 'admin-inline-empty'
      : 'admin-inline-info';

  return (
    <div className={className}>
      <span className="admin-notice-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
