import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, RefreshCw, Save, Trash2 } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import { useAdminCollection } from '../../hooks/useAdminCollection';
import { applicationsAdminService, siteSettingsAdminService } from '../../services/adminContentService';

const DEFAULT_APPLICATION_FORM_SETTINGS = {
  application_form_title: 'Apply to Join Us',
  application_form_subtitle: 'Become a Catalyst',
  application_form_year_options: ['1st', '2nd', '3rd', '4th', 'Grad'],
  application_form_domain_options: [
    'Frontend Development',
    'Backend Development',
    'App Development',
    'AI/ML',
    'Cloud',
    'Cyber Security',
    'UI/UX',
  ],
  application_form_success_redirect_seconds: 10,
};

function toLines(value = []) {
  return (Array.isArray(value) ? value : []).join('\n');
}

function parseLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeApplicationFormSettings(rawSettings = null) {
  const fallback = DEFAULT_APPLICATION_FORM_SETTINGS;

  const normalizedYears = Array.isArray(rawSettings?.application_form_year_options)
    ? rawSettings.application_form_year_options.filter((item) => typeof item === 'string' && item.trim())
    : fallback.application_form_year_options;

  const normalizedDomains = Array.isArray(rawSettings?.application_form_domain_options)
    ? rawSettings.application_form_domain_options.filter((item) => typeof item === 'string' && item.trim())
    : fallback.application_form_domain_options;

  const redirectSeconds = Number.isFinite(rawSettings?.application_form_success_redirect_seconds)
    ? Math.max(3, Math.min(30, Number(rawSettings.application_form_success_redirect_seconds)))
    : fallback.application_form_success_redirect_seconds;

  return {
    application_form_title: String(rawSettings?.application_form_title || fallback.application_form_title),
    application_form_subtitle: String(rawSettings?.application_form_subtitle || fallback.application_form_subtitle),
    application_form_year_options: normalizedYears.length ? normalizedYears : fallback.application_form_year_options,
    application_form_domain_options: normalizedDomains.length ? normalizedDomains : fallback.application_form_domain_options,
    application_form_success_redirect_seconds: redirectSeconds,
  };
}

function toDateTimeLabel(value) {
  if (!value) {
    return 'Unknown';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown';
  }

  return parsedDate.toLocaleString();
}

export default function AdminApplicationsPage() {
  const {
    items: applications,
    loading,
    error,
    loadItems,
    updateItem,
    removeItem,
  } = useAdminCollection(applicationsAdminService);

  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formSettings, setFormSettings] = useState(() => {
    const normalized = normalizeApplicationFormSettings();
    return {
      application_form_title: normalized.application_form_title,
      application_form_subtitle: normalized.application_form_subtitle,
      application_form_year_options: toLines(normalized.application_form_year_options),
      application_form_domain_options: toLines(normalized.application_form_domain_options),
      application_form_success_redirect_seconds: String(normalized.application_form_success_redirect_seconds),
    };
  });
  const [settingsErrors, setSettingsErrors] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const unreadCount = useMemo(
    () => applications.filter((item) => !item.is_read).length,
    [applications],
  );

  useEffect(() => {
    let isActive = true;

    async function loadFormSettings() {
      setSettingsLoading(true);

      try {
        const settings = await siteSettingsAdminService.get();

        if (!isActive) {
          return;
        }

        const normalized = normalizeApplicationFormSettings(settings);
        setFormSettings({
          application_form_title: normalized.application_form_title,
          application_form_subtitle: normalized.application_form_subtitle,
          application_form_year_options: toLines(normalized.application_form_year_options),
          application_form_domain_options: toLines(normalized.application_form_domain_options),
          application_form_success_redirect_seconds: String(normalized.application_form_success_redirect_seconds),
        });
      } catch {
        if (!isActive) {
          return;
        }

        const fallback = normalizeApplicationFormSettings();
        setFormSettings({
          application_form_title: fallback.application_form_title,
          application_form_subtitle: fallback.application_form_subtitle,
          application_form_year_options: toLines(fallback.application_form_year_options),
          application_form_domain_options: toLines(fallback.application_form_domain_options),
          application_form_success_redirect_seconds: String(fallback.application_form_success_redirect_seconds),
        });
      } finally {
        if (isActive) {
          setSettingsLoading(false);
        }
      }
    }

    loadFormSettings();

    return () => {
      isActive = false;
    };
  }, []);

  const setFormSetting = (key, value) => {
    setFormSettings((current) => ({ ...current, [key]: value }));
    setSettingsErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSaveFormSettings = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formSettings.application_form_title.trim()) {
      nextErrors.application_form_title = 'Form title is required.';
    }

    if (!formSettings.application_form_subtitle.trim()) {
      nextErrors.application_form_subtitle = 'Form subtitle is required.';
    }

    const yearOptions = parseLines(formSettings.application_form_year_options);
    const domainOptions = parseLines(formSettings.application_form_domain_options);
    const redirectSeconds = Number.parseInt(formSettings.application_form_success_redirect_seconds, 10);

    if (!yearOptions.length) {
      nextErrors.application_form_year_options = 'Add at least one year option.';
    }

    if (!domainOptions.length) {
      nextErrors.application_form_domain_options = 'Add at least one domain option.';
    }

    if (!Number.isFinite(redirectSeconds) || redirectSeconds < 3 || redirectSeconds > 30) {
      nextErrors.application_form_success_redirect_seconds = 'Use a value between 3 and 30 seconds.';
    }

    if (Object.keys(nextErrors).length) {
      setSettingsErrors(nextErrors);
      return;
    }

    setSettingsSaving(true);

    try {
      await siteSettingsAdminService.update({
        application_form_title: formSettings.application_form_title.trim(),
        application_form_subtitle: formSettings.application_form_subtitle.trim(),
        application_form_year_options: yearOptions,
        application_form_domain_options: domainOptions,
        application_form_success_redirect_seconds: redirectSeconds,
      });

      setStatusTone('info');
      setStatusMessage('Application form settings saved successfully.');
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save application form settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggleRead = async (application, isRead) => {
    try {
      await updateItem(application.id, { is_read: isRead });
      setStatusTone('info');
      setStatusMessage(`${application.name} marked as ${isRead ? 'read' : 'unread'}.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update read status.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await removeItem(pendingDelete.id);
      setStatusTone('info');
      setStatusMessage('Application deleted successfully.');
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this application.');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Applications"
        description="View and manage submissions from the public apply form."
        actions={(
          <>
            <a
              href="/apply"
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-secondary"
            >
              <ArrowUpRight size={16} />
              <span>Open apply page</span>
            </a>
            <button
              type="button"
              className="admin-button admin-button-primary"
              onClick={loadItems}
              disabled={loading}
            >
              <RefreshCw size={16} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      <section className="admin-card">
        <div className="admin-card-body">
          <div className="admin-card-header">
            <div>
              <h2>Incoming applications</h2>
              <p>{applications.length} total • {unreadCount} unread</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div>
                <div className="admin-loading-spinner" />
                <p>Loading applications...</p>
              </div>
            </div>
          ) : error ? (
            <AdminNotice tone="error">{error}</AdminNotice>
          ) : applications.length === 0 ? (
            <AdminNotice tone="empty">No applications yet.</AdminNotice>
          ) : (
            <div className="admin-record-list">
              {applications.map((application) => (
                <article key={application.id} className="admin-record-card">
                  <div className="admin-record-top">
                    <div>
                      <div className="admin-record-title">{application.name || 'Unnamed applicant'}</div>
                      <p className="admin-record-subtitle">{application.email || 'No email provided'}</p>
                      <p className="admin-record-copy" style={{ marginTop: '0.4rem' }}>
                        Domain: {application.domain || 'Not specified'}
                      </p>
                    </div>

                    <div className="admin-pill-row">
                      <StatusBadge
                        label={application.is_read ? 'Read' : 'Unread'}
                        tone={application.is_read ? 'hidden' : 'visible'}
                      />
                      <span className="admin-pill">{toDateTimeLabel(application.created_at)}</span>
                    </div>
                  </div>

                  <div className="admin-detail-grid" style={{ marginBottom: '0.85rem' }}>
                    <div className="admin-detail-item">
                      <span>Year</span>
                      <strong>{application.year || '-'}</strong>
                    </div>
                    <div className="admin-detail-item">
                      <span>College</span>
                      <strong>{application.college || '-'}</strong>
                    </div>
                    <div className="admin-detail-item">
                      <span>Branch</span>
                      <strong>{application.branch || '-'}</strong>
                    </div>
                    <div className="admin-detail-item">
                      <span>Tech stack</span>
                      <strong>{application.tech_stack || '-'}</strong>
                    </div>
                  </div>

                  {application.why_join ? (
                    <p className="admin-record-copy" style={{ marginBottom: '0.5rem' }}>
                      <strong>Why join:</strong> {application.why_join}
                    </p>
                  ) : null}

                  {application.project ? (
                    <p className="admin-record-copy" style={{ marginBottom: '0.5rem' }}>
                      <strong>Project:</strong> {application.project}
                    </p>
                  ) : null}

                  <div className="admin-actions">
                    {application.email ? (
                      <a
                        href={`mailto:${application.email}`}
                        className="admin-button admin-button-secondary"
                      >
                        <Mail size={16} />
                        <span>Email</span>
                      </a>
                    ) : null}

                    <ToggleSwitch
                      checked={Boolean(application.is_read)}
                      onChange={(nextValue) => handleToggleRead(application, nextValue)}
                      label={application.is_read ? 'Marked as read' : 'Mark as read'}
                      hint="Track reviewed applications."
                    />

                    <button
                      type="button"
                      className="admin-button admin-button-danger admin-button-icon"
                      onClick={() => setPendingDelete(application)}
                      aria-label={`Delete application from ${application.name || 'applicant'}`}
                      title={`Delete application from ${application.name || 'applicant'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-body">
          <div className="admin-card-header">
            <div>
              <h2>Application form settings</h2>
              <p>Edit public apply-form labels and dropdown options.</p>
            </div>
          </div>

          {settingsLoading ? (
            <div className="admin-loading">
              <div>
                <div className="admin-loading-spinner" />
                <p>Loading form settings...</p>
              </div>
            </div>
          ) : (
            <form className="admin-form" onSubmit={handleSaveFormSettings}>
              <div className="admin-form-grid">
                <AdminField
                  label="Form title"
                  htmlFor="application_form_title"
                  error={settingsErrors.application_form_title}
                >
                  <input
                    id="application_form_title"
                    className="admin-input"
                    value={formSettings.application_form_title}
                    onChange={(event) => setFormSetting('application_form_title', event.target.value)}
                  />
                </AdminField>

                <AdminField
                  label="Form subtitle"
                  htmlFor="application_form_subtitle"
                  error={settingsErrors.application_form_subtitle}
                >
                  <input
                    id="application_form_subtitle"
                    className="admin-input"
                    value={formSettings.application_form_subtitle}
                    onChange={(event) => setFormSetting('application_form_subtitle', event.target.value)}
                  />
                </AdminField>
              </div>

              <div className="admin-form-grid">
                <AdminField
                  label="Year options"
                  htmlFor="application_form_year_options"
                  description="One option per line."
                  error={settingsErrors.application_form_year_options}
                >
                  <textarea
                    id="application_form_year_options"
                    className="admin-textarea"
                    value={formSettings.application_form_year_options}
                    onChange={(event) => setFormSetting('application_form_year_options', event.target.value)}
                  />
                </AdminField>

                <AdminField
                  label="Domain options"
                  htmlFor="application_form_domain_options"
                  description="One option per line."
                  error={settingsErrors.application_form_domain_options}
                >
                  <textarea
                    id="application_form_domain_options"
                    className="admin-textarea"
                    value={formSettings.application_form_domain_options}
                    onChange={(event) => setFormSetting('application_form_domain_options', event.target.value)}
                  />
                </AdminField>
              </div>

              <AdminField
                label="Success redirect (seconds)"
                htmlFor="application_form_success_redirect_seconds"
                description="How long success modal stays before redirecting home."
                error={settingsErrors.application_form_success_redirect_seconds}
              >
                <input
                  id="application_form_success_redirect_seconds"
                  type="number"
                  min="3"
                  max="30"
                  className="admin-input"
                  value={formSettings.application_form_success_redirect_seconds}
                  onChange={(event) => setFormSetting('application_form_success_redirect_seconds', event.target.value)}
                />
              </AdminField>

              <div className="admin-form-actions">
                <button type="submit" className="admin-button admin-button-primary" disabled={settingsSaving}>
                  <Save size={16} />
                  <span>{settingsSaving ? 'Saving...' : 'Save form settings'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete application"
        description={pendingDelete
          ? `Delete application from ${pendingDelete.name || pendingDelete.email || 'this applicant'}?`
          : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
