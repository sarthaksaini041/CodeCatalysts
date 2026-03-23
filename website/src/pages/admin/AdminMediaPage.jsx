import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  HardDrive,
  Image,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [pendingDelete, setPendingDelete] = useState(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (filter === 'used' && !item.isUsed) {
        return false;
      }

      if (filter === 'unused' && item.isUsed) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${item.name} ${item.path} ${item.collection || ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [deferredSearchQuery, filter, items]);

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
        description="Review stored assets, reuse existing files, and remove unused media without touching backend behavior."
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
          label="Total media"
          value={items.length}
          description="Images available in shared storage"
          featured
        />
        <AdminStatCard
          icon={Eye}
          label="Used media"
          value={usedCount}
          description="Currently referenced by site content"
        />
        <AdminStatCard
          icon={Trash2}
          label="Unused media"
          value={unusedCount}
          description="Candidates for cleanup"
        />
        <AdminStatCard
          icon={HardDrive}
          label="Storage used"
          value={formatBytes(totalSize)}
          description="Approximate image footprint"
        />
      </section>

      <section className="admin-card">
        <div className="admin-card-body">
          <div className="admin-card-header">
            <div>
              <h2>Uploaded images</h2>
              <p>
                {filteredItems.length} shown from {items.length} total assets in storage.
              </p>
            </div>

            <div className="admin-toolbar-stack">
              <label className="admin-inline-search" htmlFor="media-search">
                <Search size={16} aria-hidden="true" />
                <input
                  id="media-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search media files"
                />
              </label>

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
          </div>

          {loading ? (
            <div className="admin-loading">
              <div>
                <div className="admin-loading-spinner" />
                <p>Loading media library...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <AdminNotice tone="empty">No images match this view.</AdminNotice>
          ) : (
            <div className="admin-media-grid">
              {filteredItems.map((item) => (
                <article key={item.path} className="admin-media-card">
                  <div className="admin-media-preview">
                    <img
                      src={item.publicUrl}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                    />
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
