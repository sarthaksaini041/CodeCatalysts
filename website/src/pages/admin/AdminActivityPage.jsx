import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminActivityRow from '../../components/admin/AdminActivityRow';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { listAdminActivity } from '../../services/adminActivityService';

export default function AdminActivityPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadActivity() {
      setLoading(true);
      setError('');

      try {
        const nextItems = await listAdminActivity();

        if (isActive) {
          setItems(nextItems);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load recent changes.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      isActive = false;
    };
  }, [refreshToken]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Recent Changes"
        description="A complete list of the latest updates across the admin portal."
        actions={(
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => setRefreshToken((current) => current + 1)}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        )}
      />

      {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}

      {loading ? (
        <div className="admin-loading">
          <div>
            <div className="admin-loading-spinner" />
            <p>Loading recent changes...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <AdminNotice tone="empty">No recent changes yet.</AdminNotice>
      ) : (
        <section className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>All changes</h2>
                <p>{items.length} updates across the managed content.</p>
              </div>
            </div>

            <div className="admin-record-list">
              {items.map((item) => (
                <AdminActivityRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
