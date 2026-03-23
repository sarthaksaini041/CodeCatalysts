import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Save } from 'lucide-react';
import AdminAuthShell from '../../components/admin/AdminAuthShell';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  connectAdminRecoverySessionFromUrl,
  getCurrentSession,
  updateAdminPassword,
} from '../../lib/adminAuth';
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

        if (isActive) {
          setHasRecoverySession(Boolean(session?.user));
        }
      } catch {
        if (isActive) {
          setHasRecoverySession(false);
        }
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

  const canShowForm = useMemo(
    () => hasRecoverySession || isAdmin,
    [hasRecoverySession, isAdmin],
  );

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
    <AdminAuthShell
      title="Reset password"
      description="Create a new password for your approved admin account."
      highlights={[
        'Recovery links are validated before the form becomes available.',
        'Passwords stay inside the existing Supabase auth flow.',
        'The new UI keeps the reset flow centered and usable on small screens.',
      ]}
    >
      {!sessionChecked ? (
        <div className="admin-loading admin-loading-inline">
          <div>
            <div className="admin-loading-spinner" />
            <p>Verifying your recovery link...</p>
          </div>
        </div>
      ) : !canShowForm ? (
        <AdminNotice tone="error">
          This recovery link is invalid or expired. Request a new reset email.
        </AdminNotice>
      ) : (
        <>
          {formError ? <AdminNotice tone="error">{formError}</AdminNotice> : null}
          {statusMessage ? <AdminNotice tone="info">{statusMessage}</AdminNotice> : null}

          <form className="admin-form" onSubmit={handleSubmit}>
            <AdminField
              label="New password"
              htmlFor="admin_reset_password"
              description="Use at least 8 characters."
            >
              <div className="admin-password-field">
                <input
                  id="admin_reset_password"
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </AdminField>

            <AdminField label="Confirm password" htmlFor="admin_reset_password_confirm">
              <div className="admin-password-field">
                <input
                  id="admin_reset_password_confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="admin-input admin-password-input"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </AdminField>

            <div className="admin-form-actions admin-auth-submit-row">
              <Link to={ADMIN_LOGIN_PATH} className="admin-button admin-button-secondary">
                Back to login
              </Link>
              <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Updating password...' : 'Update password'}</span>
              </button>
            </div>
          </form>
        </>
      )}
    </AdminAuthShell>
  );
}
