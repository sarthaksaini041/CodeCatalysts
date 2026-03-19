import { useMemo, useState } from 'react';
import { ArrowUpRight, Eye, HardDrive, Image, RefreshCw, Trash2 } from 'lucide-react';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAdminMediaLibrary } from '../../hooks/useAdminMediaLibrary';
import { formatAdminDateTime, formatAdminRelativeTime, formatBytes } from '../../utils/admin';

const FILTERS = [
  { value: 'all', label: 'All media' },
  { value: 'used', label: 'Used only' },
  { value: 'unused', label: 'Unused only' },
];

export default function AdminMediaPage() {
  const {
    items,
    loading,
    error,
    loadMedia,
    removeMedia,
  } = useAdminMediaLibrary();
  const [filter, setFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [pendingDelete, setPendingDelete] = useState(null);

  const filteredItems = useMemo(() => {
    if (filter === 'used') {
      return items.filter((item) => item.isUsed);
    }

    if (filter === 'unused') {
      return items.filter((item) => !item.isUsed);
    }

    return items;
  }, [filter, items]);

  const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
  const usedCount = items.filter((item) => item.isUsed).length;
  const unusedCount = items.length - usedCount;

  const getCollectionLabel = (item) => {
    if (item.collection === 'site-assets') {
      return 'Site asset';
    }

    if (item.collection === 'members') {
      return 'Team media';
    }

    if (item.collection === 'projects') {
      return 'Project media';
    }

    return 'Media file';
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await removeMedia(pendingDelete.path);
      setStatusTone('info');
      setStatusMessage('Media file deleted successfully.');
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this media file.');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Media"
        description="Review website media stored in Supabase, reuse existing files, and remove unused assets."
        actions={(
          <>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-secondary"
            >
              <ArrowUpRight size={16} />
              <span>Preview site</span>
            </a>
            <button type="button" className="admin-button admin-button-primary" onClick={loadMedia}>
              <RefreshCw size={16} />
              <span>Refresh media</span>
            </button>
          </>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}
      {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}

      <section className="admin-stats">
        <AdminStatCard
          icon={Image}
          label="Total Media"
          value={items.length}
          featured
        />
        <AdminStatCard
          icon={Eye}
          label="Used Media"
          value={usedCount}
        />
        <AdminStatCard
          icon={Trash2}
          label="Unused Media"
          value={unusedCount}
        />
        <AdminStatCard
          icon={HardDrive}
          label="Total Storage"
          value={formatBytes(totalSize)}
        />
      </section>

      <section className="admin-card">
        <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Uploaded images</h2>
                <p>Includes admin uploads and synced website assets stored in Supabase.</p>
              </div>
            <div className="admin-page-toolbar">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`admin-filter-chip${filter === item.value ? ' is-active' : ''}`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div>
                <div className="admin-loading-spinner" />
                <p>Loading media library...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <AdminNotice tone="empty">No images match this filter yet.</AdminNotice>
          ) : (
            <div className="admin-media-grid">
              {filteredItems.map((item) => (
                <article key={item.path} className="admin-media-card">
                  <div className="admin-media-preview">
                    <img src={item.publicUrl} alt={item.name} />
                  </div>

                  <div className="admin-media-meta">
                    <div className="admin-record-top">
                      <div>
                        <div className="admin-record-title">{item.name}</div>
                        <p className="admin-record-subtitle">{item.path}</p>
                      </div>
                      <div className="admin-pill-row">
                        <span className="admin-pill">{getCollectionLabel(item)}</span>
                        <StatusBadge
                          label={item.isUsed ? 'Used' : 'Unused'}
                          tone={item.isUsed ? 'visible' : 'hidden'}
                        />
                      </div>
                    </div>

                    <div className="admin-pill-row">
                      <span className="admin-pill">{formatBytes(item.size)}</span>
                      <span className="admin-pill">{formatAdminRelativeTime(item.updatedAt)}</span>
                    </div>

                    <p className="admin-record-copy">
                      Updated {formatAdminDateTime(item.updatedAt)}
                    </p>
                  </div>

                  <div className="admin-actions">
                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-button admin-button-secondary"
                    >
                      <Eye size={16} />
                      <span>Preview</span>
                    </a>
                    <button
                      type="button"
                      className="admin-button admin-button-danger"
                      disabled={item.isUsed}
                      onClick={() => setPendingDelete(item)}
                    >
                      <Trash2 size={16} />
                      <span>{item.isUsed ? 'In use' : 'Delete'}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete image?"
        description={`This will permanently remove ${pendingDelete?.name || 'this image'} from storage.`}
        confirmLabel="Delete image"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
