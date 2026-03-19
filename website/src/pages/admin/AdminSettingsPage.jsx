import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { siteSettings as fallbackSettings } from '../../data';
import { siteSettingsAdminService } from '../../services/adminContentService';
import { normalizeOptionalEmail, normalizeOptionalUrl, validateOptionalUrl } from '../../utils/content';

function getInitialForm(settings = fallbackSettings) {
  return {
    hero_title: settings.heroTitle || '',
    hero_subtitle: settings.heroSubtitle || '',
    contact_email: settings.contactEmail || '',
    github_url: settings.githubUrl || '',
    linkedin_url: settings.linkedinUrl || '',
    instagram_url: settings.instagramUrl || '',
    footer_text: settings.footerText || '',
  };
}

function validateSettings(form) {
  const errors = {};

  if (!form.hero_title.trim()) {
    errors.hero_title = 'Hero title is required.';
  }

  if (!form.hero_subtitle.trim()) {
    errors.hero_subtitle = 'Hero subtitle is required.';
  }

  const urlChecks = [
    ['github_url', 'GitHub URL'],
    ['linkedin_url', 'LinkedIn URL'],
    ['instagram_url', 'Instagram URL'],
  ];

  urlChecks.forEach(([key, label]) => {
    const message = validateOptionalUrl(form[key], label);
    if (message) {
      errors[key] = message;
    }
  });

  return errors;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(() => getInitialForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');

  useEffect(() => {
    let isActive = true;

    async function loadSettings() {
      setLoading(true);
      setStatusMessage('');

      try {
        const settings = await siteSettingsAdminService.get();

        if (!isActive) {
          return;
        }

        setForm(getInitialForm({
          heroTitle: settings?.hero_title || fallbackSettings.heroTitle,
          heroSubtitle: settings?.hero_subtitle || fallbackSettings.heroSubtitle,
          contactEmail: settings?.contact_email || fallbackSettings.contactEmail,
          githubUrl: settings?.github_url || fallbackSettings.githubUrl,
          linkedinUrl: settings?.linkedin_url || fallbackSettings.linkedinUrl,
          instagramUrl: settings?.instagram_url || fallbackSettings.instagramUrl,
          footerText: settings?.footer_text || fallbackSettings.footerText,
        }));
      } catch (error) {
        if (isActive) {
          setStatusMessage(error.message || 'Unable to load site settings.');
          setStatusTone('error');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isActive = false;
    };
  }, []);

  const footerPreview = useMemo(
    () => form.footer_text.replace('{year}', String(new Date().getFullYear())),
    [form.footer_text],
  );

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSettings(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      await siteSettingsAdminService.update({
        hero_title: form.hero_title.trim(),
        hero_subtitle: form.hero_subtitle.trim(),
        contact_email: normalizeOptionalEmail(form.contact_email),
        github_url: normalizeOptionalUrl(form.github_url),
        linkedin_url: normalizeOptionalUrl(form.linkedin_url),
        instagram_url: normalizeOptionalUrl(form.instagram_url),
        footer_text: form.footer_text.trim() || fallbackSettings.footerText,
      });

      setStatusTone('info');
      setStatusMessage('Site settings saved successfully.');
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to save site settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Site Settings"
        description="Edit the hero copy and public contact/footer links that appear on the main website."
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      {loading ? (
        <div className="admin-loading">
          <div>
            <div className="admin-loading-spinner" />
            <p>Loading site settings...</p>
          </div>
        </div>
      ) : (
        <section className="admin-grid">
          <div className="admin-card">
            <div className="admin-card-body">
              <div className="admin-card-header">
                <div>
                  <h2>Public copy and links</h2>
                  <p>These values feed the hero section and footer on the public website.</p>
                </div>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                <AdminField label="Hero title" htmlFor="hero_title" error={errors.hero_title}>
                  <input
                    id="hero_title"
                    className="admin-input"
                    value={form.hero_title}
                    onChange={(event) => setField('hero_title', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Hero subtitle" htmlFor="hero_subtitle" error={errors.hero_subtitle}>
                  <textarea
                    id="hero_subtitle"
                    className="admin-textarea"
                    value={form.hero_subtitle}
                    onChange={(event) => setField('hero_subtitle', event.target.value)}
                  />
                </AdminField>

                <div className="admin-form-grid">
                  <AdminField label="Contact email" htmlFor="contact_email">
                    <input
                      id="contact_email"
                      type="email"
                      className="admin-input"
                      value={form.contact_email}
                      onChange={(event) => setField('contact_email', event.target.value)}
                    />
                  </AdminField>

                  <AdminField label="GitHub URL" htmlFor="github_url" error={errors.github_url}>
                    <input
                      id="github_url"
                      className="admin-input"
                      value={form.github_url}
                      onChange={(event) => setField('github_url', event.target.value)}
                    />
                  </AdminField>

                  <AdminField label="LinkedIn URL" htmlFor="linkedin_url" error={errors.linkedin_url}>
                    <input
                      id="linkedin_url"
                      className="admin-input"
                      value={form.linkedin_url}
                      onChange={(event) => setField('linkedin_url', event.target.value)}
                    />
                  </AdminField>

                  <AdminField label="Instagram URL" htmlFor="instagram_url" error={errors.instagram_url}>
                    <input
                      id="instagram_url"
                      className="admin-input"
                      value={form.instagram_url}
                      onChange={(event) => setField('instagram_url', event.target.value)}
                    />
                  </AdminField>
                </div>

                <AdminField
                  label="Footer text"
                  htmlFor="footer_text"
                  description="Use {year} if you want the current year to be inserted automatically."
                >
                  <input
                    id="footer_text"
                    className="admin-input"
                    value={form.footer_text}
                    onChange={(event) => setField('footer_text', event.target.value)}
                  />
                </AdminField>

                <div className="admin-form-actions">
                  <div className="admin-field-copy">
                    Live preview: {footerPreview}
                  </div>
                  <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <div className="admin-card-header">
                <div>
                  <h2>Preview notes</h2>
                  <p>How these values are used on the current site.</p>
                </div>
              </div>

              <div className="admin-record-list">
                <div className="admin-record-card">
                  <div className="admin-record-title">Hero section</div>
                  <p className="admin-record-copy">
                    `hero_title` and `hero_subtitle` feed the landing page headline and intro copy.
                  </p>
                </div>
                <div className="admin-record-card">
                  <div className="admin-record-title">Footer contact links</div>
                  <p className="admin-record-copy">
                    `contact_email`, `github_url`, `linkedin_url`, and `instagram_url` power the footer action links.
                  </p>
                </div>
                <div className="admin-record-card">
                  <div className="admin-record-title">Footer copyright</div>
                  <p className="admin-record-copy">
                    `footer_text` is shown in the bottom bar. The {'{year}'} token is replaced automatically on render.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
