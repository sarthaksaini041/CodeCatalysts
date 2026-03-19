import { Link } from 'react-router-dom';
import { formatAdminDateTime, formatAdminRelativeTime } from '../../utils/admin';

export default function AdminActivityRow({ item, compact = false, onClick }) {
  return (
    <Link
      to={item.href}
      className={`admin-activity-item${compact ? ' is-compact' : ''}`}
      onClick={onClick}
    >
      <div className="admin-activity-meta">
        <span className="admin-pill">{item.type}</span>
        <div>
          <div className="admin-record-title">{item.title}</div>
          <p className="admin-record-copy">{item.description}</p>
        </div>
      </div>
      <div className="admin-activity-time">
        <strong>{formatAdminRelativeTime(item.timestamp)}</strong>
        <span>{formatAdminDateTime(item.timestamp)}</span>
      </div>
    </Link>
  );
}
