import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Edit3,
  Milestone,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import { useAdminCollection } from '../../hooks/useAdminCollection';
import { useAdminEditorAutoReveal } from '../../hooks/useAdminEditorAutoReveal';
import { showAdminToast } from '../../lib/adminToast';
import { journeyAdminService } from '../../services/adminContentService';
import { normalizeNullableString } from '../../utils/content';

const EMPTY_JOURNEY_FORM = {
  title: '',
  date_label: '',
  description: '',
  icon_name: '',
  is_visible: true,
};

function mapJourneyToForm(item) {
  return {
    title: item.title || '',
    date_label: item.date_label || '',
    description: item.description || '',
    icon_name: item.icon_name || '',
    is_visible: Boolean(item.is_visible),
  };
}

function validateJourney(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!form.date_label.trim()) {
    errors.date_label = 'Date label is required.';
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required.';
  }

  return errors;
}

export default function AdminJourneyPage() {
  const {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  } = useAdminCollection(journeyAdminService);
  const [form, setForm] = useState(EMPTY_JOURNEY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const editorRef = useAdminEditorAutoReveal(isEditorOpen);

  const editingItem = useMemo(
    () => items.find((entry) => entry.id === editingId) || null,
    [editingId, items],
  );

  const resetForm = () => {
    setForm(EMPTY_JOURNEY_FORM);
    setEditingId(null);
    setIsEditorOpen(false);
    setFormErrors({});
  };

  const startCreateEntry = () => {
    setForm(EMPTY_JOURNEY_FORM);
    setEditingId(null);
    setIsEditorOpen(true);
    setFormErrors({});
    setStatusMessage('');
  };

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIsEditorOpen(true);
    setForm(mapJourneyToForm(item));
    setFormErrors({});
    setStatusMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateJourney(form);
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      const payload = {
        title: form.title.trim(),
        date_label: form.date_label.trim(),
        description: form.description.trim(),
        icon_name: normalizeNullableString(form.icon_name),
        is_visible: Boolean(form.is_visible),
        display_order: editingItem?.display_order ?? items.length,
      };

      if (editingItem) {
        await updateItem(editingItem.id, payload);
        setStatusMessage('Journey entry updated successfully.');
      } else {
        await createItem(payload);
        setStatusMessage('Journey entry created successfully.');
        showAdminToast({
          title: 'New journey entry created',
          message: `${payload.title} was added successfully.`,
        });
      }

      setStatusTone('info');
      resetForm();
      await loadItems();
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save this journey entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await removeItem(pendingDelete.id);
      if (pendingDelete.id === editingId) {
        resetForm();
      }
      setStatusTone('info');
      setStatusMessage('Journey entry deleted successfully.');
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this journey entry.');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleToggleVisibility = async (item, isVisible) => {
    try {
      await updateItem(item.id, { is_visible: isVisible });
      setStatusTone('info');
      setStatusMessage(`${item.title} is now ${isVisible ? 'visible' : 'hidden'} on the website.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update visibility.');
    }
  };

  const handleMove = async (index, direction) => {
    try {
      await reorderItems(index, direction);
      setStatusTone('info');
      setStatusMessage('Journey order updated.');
      await loadItems();
    } catch (moveError) {
      setStatusTone('error');
      setStatusMessage(moveError.message || 'Unable to reorder journey entries.');
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Journey"
        description="Manage timeline entries, visibility, and display order."
        actions={(
          <>
            <a
              href="/#journey"
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-secondary"
            >
              <ArrowUpRight size={16} />
              <span>Preview journey</span>
            </a>
            <button
              type="button"
              className="admin-button admin-button-primary admin-button-icon"
              onClick={startCreateEntry}
              aria-label="Create journey entry"
              title="Create journey entry"
            >
              <Plus size={18} />
            </button>
          </>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      <section className={`admin-grid${isEditorOpen ? '' : ' admin-grid-single'}`}>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Current timeline</h2>
                <p>These entries appear in the public journey section.</p>
              </div>
            </div>

            {loading ? (
              <div className="admin-loading">
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Loading journey entries...</p>
                </div>
              </div>
            ) : error ? (
              <AdminNotice tone="error">{error}</AdminNotice>
            ) : items.length === 0 ? (
              <AdminNotice tone="empty">No journey entries yet. Use the + button to add the first milestone.</AdminNotice>
            ) : (
              <div className="admin-record-list">
                {items.map((item, index) => (
                  <article key={item.id} className="admin-record-card">
                    <div className="admin-record-top">
                      <div className="admin-record-meta">
                        <div className="admin-record-thumb">
                          <div className="admin-upload-placeholder admin-upload-placeholder-fill">
                            <Milestone size={18} />
                          </div>
                        </div>

                        <div>
                          <div className="admin-record-title">{item.title}</div>
                          <p className="admin-record-subtitle">{item.date_label}</p>
                          <p className="admin-record-copy admin-record-copy-offset-lg">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="admin-pill-row">
                        <StatusBadge label={item.is_visible ? 'Visible' : 'Hidden'} tone={item.is_visible ? 'visible' : 'hidden'} />
                        <span className="admin-pill">Order {index + 1}</span>
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={item.is_visible}
                      onChange={(nextValue) => handleToggleVisibility(item, nextValue)}
                      label={item.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                      hint="Hide without deleting."
                    />

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-up"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${item.title} up`}
                        title={`Move ${item.title} up`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-down"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === items.length - 1}
                        aria-label={`Move ${item.title} down`}
                        title={`Move ${item.title} down`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-edit"
                        onClick={() => handleEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        title={`Edit ${item.title}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-danger admin-button-icon"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${item.title}`}
                        title={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditorOpen ? (
        <div ref={editorRef} className="admin-card admin-editor-card">
            <div className="admin-card-body">
              <div className="admin-card-header">
                <div>
                  <h2>Journey editor</h2>
                  <p>{editingItem ? 'Update this entry.' : 'Create a new timeline entry.'}</p>
                </div>
              </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <AdminField label="Title" htmlFor="journey_title" error={formErrors.title}>
                <input
                  id="journey_title"
                  className="admin-input"
                  value={form.title}
                  onChange={(event) => setField('title', event.target.value)}
                />
              </AdminField>

              <AdminField label="Date label" htmlFor="journey_date_label" error={formErrors.date_label}>
                <input
                  id="journey_date_label"
                  className="admin-input"
                  value={form.date_label}
                  onChange={(event) => setField('date_label', event.target.value)}
                  placeholder="e.g. Oct 2025"
                />
              </AdminField>

              <AdminField label="Description" htmlFor="journey_description" error={formErrors.description}>
                <textarea
                  id="journey_description"
                  className="admin-textarea"
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                />
              </AdminField>

              <AdminField
                label="Icon name"
                htmlFor="journey_icon_name"
                description="Optional internal label."
              >
                <input
                  id="journey_icon_name"
                  className="admin-input"
                  value={form.icon_name}
                  onChange={(event) => setField('icon_name', event.target.value)}
                />
              </AdminField>

              <ToggleSwitch
                checked={form.is_visible}
                onChange={(nextValue) => setField('is_visible', nextValue)}
                label={form.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                hint="Save as draft or archive without deleting."
              />

              <div className="admin-form-actions">
                <button type="button" className="admin-button admin-button-ghost" onClick={resetForm}>
                  {editingItem ? 'Cancel edit' : 'Cancel'}
                </button>
                <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingItem ? 'Save entry' : 'Create entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete journey entry?"
        description={`This will permanently remove ${pendingDelete?.title || 'this entry'} from the timeline.`}
        confirmLabel="Delete entry"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
