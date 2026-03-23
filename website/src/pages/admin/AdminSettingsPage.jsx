import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Save } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { siteSettingsAdminService } from '../../services/adminContentService';
import { normalizeOptionalEmail, normalizeOptionalUrl, validateOptionalUrl } from '../../utils/content';

const DEFAULT_SITE_SETTINGS = {
  heroTitle: 'Code Catalysts',
  heroSubtitle: 'Not experts yet - just people who love learning and creating.',
  contactEmail: 'team@codecatalysts.dev',
  githubUrl: '',
  linkedinUrl: 'https://www.linkedin.com/company/code-catalysts000/',
  instagramUrl: 'https://www.instagram.com/codecatalysts',
  twitterUrl: '',
  footerText: 'Copyright {year} Code Catalysts. Built by the team.',
  ctaButtonText: 'Join the Build Squad',
  brandLinks: [],
};

function getInitialForm(settings = DEFAULT_SITE_SETTINGS) {
  return {
    hero_title: settings.heroTitle || '',
    hero_subtitle: settings.heroSubtitle || '',
    contact_email: settings.contactEmail || '',
    github_url: settings.githubUrl || '',
    linkedin_url: settings.linkedinUrl || '',
    instagram_url: settings.instagramUrl || '',
    twitter_url: settings.twitterUrl || '',
    footer_text: settings.footerText || '',
    cta_button_text: settings.ctaButtonText || 'Join the Build Squad',
    brand_primary_label: settings.brandLinks?.[0]?.label || '',
    brand_primary_url: settings.brandLinks?.[0]?.url || '',
    brand_secondary_label: settings.brandLinks?.[1]?.label || '',
    brand_secondary_url: settings.brandLinks?.[1]?.url || '',
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
    ['twitter_url', 'Twitter / X URL'],
    ['brand_primary_url', 'Primary brand link URL'],
    ['brand_secondary_url', 'Secondary brand link URL'],
  ];

  urlChecks.forEach(([key, label]) => {
    const message = validateOptionalUrl(form[key], label);
    if (message) {
      errors[key] = message;
    }
  });

  [
    ['brand_primary_label', 'brand_primary_url', 'Primary brand link'],
    ['brand_secondary_label', 'brand_secondary_url', 'Secondary brand link'],
  ].forEach(([labelKey, urlKey, fieldLabel]) => {
    const hasLabel = form[labelKey].trim();
    const hasUrl = form[urlKey].trim();

    if (hasLabel && !hasUrl) {
      errors[urlKey] = `${fieldLabel} needs a valid URL.`;
    }

    if (hasUrl && !hasLabel) {
      errors[labelKey] = `${fieldLabel} needs a button label.`;
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
          heroTitle: settings?.hero_title || DEFAULT_SITE_SETTINGS.heroTitle,
          heroSubtitle: settings?.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
          contactEmail: settings?.contact_email || DEFAULT_SITE_SETTINGS.contactEmail,
          githubUrl: settings?.github_url || DEFAULT_SITE_SETTINGS.githubUrl,
          linkedinUrl: settings?.linkedin_url || DEFAULT_SITE_SETTINGS.linkedinUrl,
          instagramUrl: settings?.instagram_url || DEFAULT_SITE_SETTINGS.instagramUrl,
          twitterUrl: settings?.twitter_url || DEFAULT_SITE_SETTINGS.twitterUrl,
          footerText: settings?.footer_text || DEFAULT_SITE_SETTINGS.footerText,
          ctaButtonText: settings?.cta_button_text || DEFAULT_SITE_SETTINGS.ctaButtonText,
          brandLinks: [
            {
              label: settings?.brand_primary_label || '',
              url: settings?.brand_primary_url || '',
            },
            {
              label: settings?.brand_secondary_label || '',
              url: settings?.brand_secondary_url || '',
            },
          ].filter((item) => item.label && item.url),
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
        twitter_url: normalizeOptionalUrl(form.twitter_url),
        footer_text: form.footer_text.trim() || DEFAULT_SITE_SETTINGS.footerText,
        cta_button_text: form.cta_button_text.trim() || DEFAULT_SITE_SETTINGS.ctaButtonText,
        brand_primary_label: form.brand_primary_label.trim() || null,
        brand_primary_url: normalizeOptionalUrl(form.brand_primary_url),
        brand_secondary_label: form.brand_secondary_label.trim() || null,
        brand_secondary_url: normalizeOptionalUrl(form.brand_secondary_url),
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
        description="Manage hero copy, CTA text, footer text, and key brand links."
        actions={(
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-button admin-button-secondary"
          >
            <ArrowUpRight size={16} />
            <span>Preview site</span>
          </a>
        )}
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
                <p>These values power the public hero and footer.</p>
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

                  <AdminField label="Twitter / X URL" htmlFor="twitter_url" error={errors.twitter_url}>
                    <input
                      id="twitter_url"
                      className="admin-input"
                      value={form.twitter_url}
                      onChange={(event) => setField('twitter_url', event.target.value)}
                    />
                  </AdminField>
                </div>

                <AdminField
                  label="CTA button text"
                  htmlFor="cta_button_text"
                  description="Updates the join section button label."
                >
                  <input
                    id="cta_button_text"
                    className="admin-input"
                    value={form.cta_button_text}
                    onChange={(event) => setField('cta_button_text', event.target.value)}
                  />
                </AdminField>

                <AdminField
                  label="Footer text"
                  htmlFor="footer_text"
                  description="Use {year} to insert the current year automatically."
                >
                  <input
                    id="footer_text"
                    className="admin-input"
                    value={form.footer_text}
                    onChange={(event) => setField('footer_text', event.target.value)}
                  />
                </AdminField>

                <div className="admin-card admin-card-soft">
                  <div className="admin-card-body">
                    <div className="admin-card-header">
                      <div>
                        <h3>Brand links</h3>
                        <p>Optional footer buttons for key destinations.</p>
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <AdminField label="Primary brand label" htmlFor="brand_primary_label" error={errors.brand_primary_label}>
                        <input
                          id="brand_primary_label"
                          className="admin-input"
                          value={form.brand_primary_label}
                          onChange={(event) => setField('brand_primary_label', event.target.value)}
                        />
                      </AdminField>

                      <AdminField label="Primary brand URL" htmlFor="brand_primary_url" error={errors.brand_primary_url}>
                        <input
                          id="brand_primary_url"
                          className="admin-input"
                          value={form.brand_primary_url}
                          onChange={(event) => setField('brand_primary_url', event.target.value)}
                        />
                      </AdminField>

                      <AdminField label="Secondary brand label" htmlFor="brand_secondary_label" error={errors.brand_secondary_label}>
                        <input
                          id="brand_secondary_label"
                          className="admin-input"
                          value={form.brand_secondary_label}
                          onChange={(event) => setField('brand_secondary_label', event.target.value)}
                        />
                      </AdminField>

                      <AdminField label="Secondary brand URL" htmlFor="brand_secondary_url" error={errors.brand_secondary_url}>
                        <input
                          id="brand_secondary_url"
                          className="admin-input"
                          value={form.brand_secondary_url}
                          onChange={(event) => setField('brand_secondary_url', event.target.value)}
                        />
                      </AdminField>
                    </div>
                  </div>
                </div>

                <div className="admin-form-actions">
                  <div className="admin-field-copy">
                    Live preview: {footerPreview} | CTA: {form.cta_button_text || DEFAULT_SITE_SETTINGS.ctaButtonText}
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
                  <p>Where these values appear on the site.</p>
                </div>
              </div>

              <div className="admin-record-list">
                <div className="admin-record-card">
                  <div className="admin-record-title">Hero section</div>
                  <p className="admin-record-copy">
                    Controls the main headline and supporting copy on the landing page.
                  </p>
                </div>
                <div className="admin-record-card">
                  <div className="admin-record-title">Footer contact links</div>
                  <p className="admin-record-copy">
                    Shows your contact email and social links in the footer.
                  </p>
                </div>
                <div className="admin-record-card">
                  <div className="admin-record-title">Join section CTA</div>
                  <p className="admin-record-copy">
                    Updates the main button label in the join section.
                  </p>
                </div>
                <div className="admin-record-card">
                  <div className="admin-record-title">Footer copyright</div>
                  <p className="admin-record-copy">
                    Appears in the bottom bar. The {`{year}`} placeholder updates automatically.
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
