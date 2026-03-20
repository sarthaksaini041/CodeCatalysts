import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../../lib/brandAssets';
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

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setFormError('Enter your admin email first, then click Forgot password.');
      return;
    }

    setSendingReset(true);

    try {
      const redirectUrl = new URL(ADMIN_RECOVERY_PATH, window.location.origin).toString();
      await requestAdminPasswordReset(normalizedEmail, redirectUrl);
      setStatusMessage('Password reset email sent. Open the latest link to set a new admin password.');
    } catch (error) {
      setFormError(error.message || 'Unable to send password reset email.');
    } finally {
      setSendingReset(false);
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
              <h1 style={{ fontSize: '2rem' }}>Admin Login</h1>
              <p className="admin-record-copy">
                Sign in with your Supabase Auth admin account to manage the live website content.
              </p>
            </div>

            {authError ? <AdminNotice tone="error">{authError}</AdminNotice> : null}
            {formError ? <AdminNotice tone="error">{formError}</AdminNotice> : null}
            {statusMessage ? <AdminNotice tone="info">{statusMessage}</AdminNotice> : null}

            <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <AdminField label="Email" htmlFor="admin-email">
                <input
                  id="admin-email"
                  type="email"
                  className="admin-input"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@codecatalysts.dev"
                />
              </AdminField>

              <AdminField label="Password" htmlFor="admin-password">
                <div className="admin-password-field">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className="admin-input admin-password-input"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your admin password"
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

              <button
                type="button"
                className="admin-button admin-button-ghost"
                style={{ justifySelf: 'start' }}
                onClick={handleForgotPassword}
                disabled={sendingReset || submitting || isLoading}
              >
                {sendingReset ? 'Sending reset link...' : 'Forgot password?'}
              </button>

              <div className="admin-form-actions">
                <div className="admin-page-toolbar" style={{ marginLeft: 0 }}>
                  <Link to="/" className="admin-button admin-button-ghost">
                    Back to site
                  </Link>
                </div>
                <button type="submit" className="admin-button admin-button-primary" disabled={submitting || isLoading}>
                  <LogIn size={16} />
                  <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
