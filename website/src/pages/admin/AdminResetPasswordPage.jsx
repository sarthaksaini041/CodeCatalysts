import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Save } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  connectAdminRecoverySessionFromUrl,
  getCurrentSession,
  updateAdminPassword,
} from '../../lib/adminAuth';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../../lib/brandAssets';
import { ADMIN_LOGIN_PATH, ADMIN_PORTAL_BASE_PATH } from '../../lib/adminPortalRoutes';

export default function AdminResetPasswordPage() {
  const { isAdmin, isLoading } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkRecoverySession() {
      try {
        await connectAdminRecoverySessionFromUrl();
        const session = await getCurrentSession();

        if (!isActive) {
          return;
        }

        setHasRecoverySession(Boolean(session?.user));
      } catch {
        if (!isActive) {
          return;
        }

        setHasRecoverySession(false);
      } finally {
        if (isActive) {
          setSessionChecked(true);
        }
      }
    }

    checkRecoverySession();

    return () => {
      isActive = false;
    };
  }, []);

  const canShowForm = useMemo(() => hasRecoverySession || isAdmin, [hasRecoverySession, isAdmin]);

  if (!isLoading && isAdmin && statusMessage) {
    return <Navigate to={ADMIN_PORTAL_BASE_PATH} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (password.length < 8) {
      setFormError('Use at least 8 characters for the new password.');
      return;
    }

    if (confirmPassword !== password) {
      setFormError('Passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      await updateAdminPassword(password);
      setPassword('');
      setConfirmPassword('');
      setStatusMessage('Password updated successfully. You can now sign in to the admin portal.');
    } catch (error) {
      setFormError(error.message || 'Unable to update the password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-login-shell">
        <div className="admin-card admin-login-card">
          <div className="admin-card-body">
            <div style={{ display: 'grid', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div className="admin-brand-mark">
                <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="admin-brand-image" />
              </div>
              <h1 style={{ fontSize: '2rem' }}>Reset Password</h1>
              <p className="admin-record-copy">
                Set a new admin password using your Supabase recovery session.
              </p>
            </div>

            {!sessionChecked ? (
              <div className="admin-loading" style={{ minHeight: '140px' }}>
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Verifying recovery link...</p>
                </div>
              </div>
            ) : !canShowForm ? (
              <AdminNotice tone="error">
                This recovery link is invalid or expired. Request a new reset email and open the latest link.
              </AdminNotice>
            ) : (
              <>
                {formError ? <AdminNotice tone="error">{formError}</AdminNotice> : null}
                {statusMessage ? <AdminNotice tone="info">{statusMessage}</AdminNotice> : null}

                <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                  <AdminField
                    label="New password"
                    htmlFor="admin-reset-password"
                    description="Use at least 8 characters."
                  >
                    <div className="admin-password-field">
                      <input
                        id="admin-reset-password"
                        type={showPassword ? 'text' : 'password'}
                        className="admin-input admin-password-input"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        className="admin-password-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </AdminField>

                  <AdminField label="Confirm password" htmlFor="admin-reset-password-confirm">
                    <div className="admin-password-field">
                      <input
                        id="admin-reset-password-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="admin-input admin-password-input"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="admin-password-toggle"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showConfirmPassword}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </AdminField>

                  <div className="admin-form-actions">
                    <Link to={ADMIN_LOGIN_PATH} className="admin-button admin-button-ghost">
                      Back to login
                    </Link>
                    <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                      <Save size={16} />
                      <span>{saving ? 'Saving...' : 'Update password'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
