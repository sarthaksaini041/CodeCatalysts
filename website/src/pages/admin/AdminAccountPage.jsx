import { useState } from 'react';
import { ArrowUpRight, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { updateAdminPassword } from '../../lib/adminAuth';
import { getAdminDisplayName, getAdminUsername } from '../../utils/adminProfile';

export default function AdminAccountPage() {
  const { user, signOut } = useAdminAuth();
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');

  const setPasswordField = (key, value) => {
    setPasswordForm((current) => ({ ...current, [key]: value }));
    setPasswordErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (passwordForm.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }
    if (passwordForm.confirmPassword !== passwordForm.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length) {
      setPasswordErrors(nextErrors);
      return;
    }

    setSavingPassword(true);
    setStatusMessage('');

    try {
      await updateAdminPassword(passwordForm.password);
      setPasswordForm({ password: '', confirmPassword: '' });
      setStatusTone('info');
      setStatusMessage('Password updated successfully.');
    } catch (updateError) {
      setStatusTone('error');
      setStatusMessage(updateError.message || 'Unable to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Account"
        description="Review your admin account and manage password or session settings."
        actions={(
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-button admin-button-secondary"
          >
            <ArrowUpRight size={16} />
            <span>Open website</span>
          </a>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      <section className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Account overview</h2>
                <p>Quick details about the admin account currently signed in.</p>
              </div>
            </div>

            <div className="admin-record-list">
              <div className="admin-record-card">
                <div className="admin-record-top">
                  <div>
                    <div className="admin-record-title">{getAdminDisplayName(user)}</div>
                    <p className="admin-record-subtitle">@{getAdminUsername(user)}</p>
                    <p className="admin-record-copy" style={{ marginTop: '0.45rem' }}>
                      {user?.email || 'Authenticated admin'}
                    </p>
                  </div>
                  <StatusBadge label="Admin access" tone="visible" />
                </div>
              </div>
              <div className="admin-record-card">
                <div className="admin-record-top">
                  <div>
                    <div className="admin-record-title">Permissions</div>
                    <p className="admin-record-copy">
                      This account can manage content, media, settings, and FAQs.
                    </p>
                  </div>
                  <div className="admin-nav-icon">
                    <ShieldCheck size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Security</h2>
                <p>Change the password and manage the current session.</p>
              </div>
            </div>

            <form className="admin-form" onSubmit={handlePasswordSubmit}>
              <AdminField
                label="New password"
                htmlFor="admin_password"
                description="Use at least 8 characters."
                error={passwordErrors.password}
              >
                <input
                  id="admin_password"
                  type="password"
                  className="admin-input"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordField('password', event.target.value)}
                />
              </AdminField>

              <AdminField
                label="Confirm new password"
                htmlFor="admin_confirm_password"
                error={passwordErrors.confirmPassword}
              >
                <input
                  id="admin_confirm_password"
                  type="password"
                  className="admin-input"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordField('confirmPassword', event.target.value)}
                />
              </AdminField>

              <div className="admin-form-actions">
                <button type="submit" className="admin-button admin-button-primary" disabled={savingPassword}>
                  <LockKeyhole size={16} />
                  <span>{savingPassword ? 'Saving...' : 'Change password'}</span>
                </button>
                <button type="button" className="admin-button admin-button-secondary" onClick={signOut}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
