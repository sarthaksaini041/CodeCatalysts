export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  description = '',
  featured = false,
}) {
  return (
    <div className={`admin-stat-card${featured ? ' is-primary' : ''}`}>
      <div className="admin-stat-card-head">
        <div className="admin-stat-label">
          {Icon ? <Icon size={16} /> : null}
          <span>{label}</span>
        </div>
      </div>
      <div className="admin-stat-value">{value}</div>
      {description ? <p className="admin-stat-copy">{description}</p> : null}
    </div>
  );
}
