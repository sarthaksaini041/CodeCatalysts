const toneMap = {
  visible: 'tone-success',
  hidden: 'tone-muted',
  featured: 'tone-warning',
  inactive: 'tone-danger',
};

export default function StatusBadge({ label, tone = 'muted' }) {
  const className = toneMap[tone] || toneMap.hidden;
  return (
    <span className={`admin-status-badge ${className}`}>
      {label}
    </span>
  );
}
