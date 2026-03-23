import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AdminAuthShell from '../../components/admin/AdminAuthShell';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { requestAdminPasswordReset } from '../../lib/adminAuth';
import { ADMIN_PORTAL_BASE_PATH, ADMIN_RECOVERY_PATH } from '../../lib/adminPortalRoutes';

export default function AdminLoginPage() {
  const location = useLocation();
  const redirectTo = location.state?.from || ADMIN_PORTAL_BASE_PATH;
  const { signIn, isAdmin, isLoading, error: authError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  if (isAdmin && !isLoading) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (!email.trim() || !password.trim()) {
      setFormError('Enter both your admin email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(error.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError('');
    setStatusMessage('');

    if (!email.trim()) {
      setFormError('Enter your admin email first, then request the password reset link.');
      return;
    }

    setSendingReset(true);

    try {
      const redirectUrl = new URL(ADMIN_RECOVERY_PATH, window.location.origin).toString();
      await requestAdminPasswordReset(email.trim(), redirectUrl);
      setStatusMessage('Password reset email sent. Open the newest link to set a new admin password.');
    } catch (error) {
      setFormError(error.message || 'Unable to send the password reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <AdminAuthShell
      title="Sign in"
      description="Use an approved admin account to access the control center."
    >
      {authError ? <AdminNotice tone="error">{authError}</AdminNotice> : null}
      {formError ? <AdminNotice tone="error">{formError}</AdminNotice> : null}
      {statusMessage ? <AdminNotice tone="info">{statusMessage}</AdminNotice> : null}

      <form className="admin-form" onSubmit={handleSubmit}>
        <AdminField label="Email address" htmlFor="admin_login_email">
          <input
            id="admin_login_email"
            type="email"
            className="admin-input"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@codecatalysts.dev"
          />
        </AdminField>

        <AdminField label="Password" htmlFor="admin_login_password">
          <div className="admin-password-field">
            <input
              id="admin_login_password"
              type={showPassword ? 'text' : 'password'}
              className="admin-input admin-password-input"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
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

        <div className="admin-auth-actions-row">
          <button
            type="button"
            className="admin-button admin-button-ghost admin-button-link"
            onClick={handleForgotPassword}
            disabled={sendingReset || submitting || isLoading}
          >
            {sendingReset ? 'Sending reset link...' : 'Forgot password?'}
          </button>
          <span className="admin-auth-meta">Reset links are sent to the email above.</span>
        </div>

        <div className="admin-form-actions admin-auth-submit-row">
          <Link to="/" className="admin-button admin-button-secondary">
            Back to site
          </Link>
          <button
            type="submit"
            className="admin-button admin-button-primary"
            disabled={submitting || isLoading}
          >
            <LogIn size={16} />
            <span>{submitting ? 'Signing in...' : 'Sign in to portal'}</span>
          </button>
        </div>
      </form>
    </AdminAuthShell>
  );
}
