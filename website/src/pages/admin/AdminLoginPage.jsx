import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginPage() {
  const location = useLocation();
  const redirectTo = location.state?.from || '/admin';
  const { signIn, isAdmin, isLoading, error: authError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin && !isLoading) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

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

  return (
    <div className="admin-shell">
      <div className="admin-login-shell">
        <div className="admin-card admin-login-card">
          <div className="admin-card-body">
            <div style={{ display: 'grid', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div className="admin-brand-mark">
                <LockKeyhole size={20} />
              </div>
              <h1 style={{ fontSize: '2rem' }}>Admin Login</h1>
              <p className="admin-record-copy">
                Sign in with your Supabase Auth admin account to manage the live website content.
              </p>
            </div>

            {authError ? <AdminNotice tone="error">{authError}</AdminNotice> : null}
            {formError ? <AdminNotice tone="error">{formError}</AdminNotice> : null}

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

              <div className="admin-form-actions">
                <Link to="/" className="admin-button admin-button-ghost">
                  Back to site
                </Link>
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
