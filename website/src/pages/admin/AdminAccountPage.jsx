import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showAdminToast } from '../../lib/adminToast';
import { updateAdminPassword } from '../../lib/adminAuth';
import { adminUsersAdminService } from '../../services/adminContentService';
import { getAdminDisplayName, getAdminUsername } from '../../utils/adminProfile';

export default function AdminAccountPage() {
  const { user, signOut } = useAdminAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(true);
  const [adminUsersError, setAdminUsersError] = useState('');
  const [addAdminForm, setAddAdminForm] = useState({
    user_id: '',
    email: '',
  });
  const [addAdminErrors, setAddAdminErrors] = useState({});
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');

  const currentUserId = user?.id || '';
  const adminCountLabel = useMemo(
    () => `${adminUsers.length} admin${adminUsers.length === 1 ? '' : 's'}`,
    [adminUsers.length],
  );

  const loadAdminUsers = async () => {
    setLoadingAdminUsers(true);
    setAdminUsersError('');

    try {
      const nextUsers = await adminUsersAdminService.list();
      setAdminUsers(nextUsers);
    } catch (error) {
      setAdminUsersError(error.message || 'Unable to load admin users.');
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const setPasswordField = (key, value) => {
    setPasswordForm((current) => ({ ...current, [key]: value }));
    setPasswordErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const setAddAdminField = (key, value) => {
    setAddAdminForm((current) => ({ ...current, [key]: value }));
    setAddAdminErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleAddAdminSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    const normalizedUserId = addAdminForm.user_id.trim();
    const normalizedEmail = addAdminForm.email.trim();

    if (!normalizedUserId) {
      nextErrors.user_id = 'Auth user ID is required.';
    } else if (!/^[0-9a-fA-F-]{36}$/.test(normalizedUserId)) {
      nextErrors.user_id = 'Enter a valid UUID.';
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (Object.keys(nextErrors).length) {
      setAddAdminErrors(nextErrors);
      return;
    }

    setAddingAdmin(true);
    setStatusMessage('');

    try {
      await adminUsersAdminService.create({
        user_id: normalizedUserId,
        email: normalizedEmail,
      });

      setAddAdminForm({ user_id: '', email: '' });
      setStatusTone('info');
      setStatusMessage('Admin user added successfully.');
      showAdminToast({
        title: 'New admin added',
        message: normalizedEmail || normalizedUserId,
      });
      await loadAdminUsers();
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to add this admin user.');
    } finally {
      setAddingAdmin(false);
    }
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
                    <div className="admin-record-title">Admin users</div>
                    <p className="admin-record-copy">
                      This portal currently has {adminCountLabel} with elevated access.
                    </p>
                  </div>
                  <div className="admin-nav-icon">
                    <ShieldCheck size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card-header" style={{ marginTop: '1rem' }}>
              <div>
                <h2>All admin users</h2>
                <p>Everyone listed here can access and manage the admin portal.</p>
              </div>
            </div>

            {loadingAdminUsers ? (
              <div className="admin-loading" style={{ minHeight: '120px' }}>
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Loading admin users...</p>
                </div>
              </div>
            ) : adminUsersError ? (
              <AdminNotice tone="error">{adminUsersError}</AdminNotice>
            ) : adminUsers.length === 0 ? (
              <AdminNotice tone="empty">No admin users found.</AdminNotice>
            ) : (
              <div className="admin-record-list" style={{ marginTop: '0.75rem' }}>
                {adminUsers.map((adminEntry) => {
                  const isCurrentUser = currentUserId && adminEntry.user_id === currentUserId;

                  return (
                    <div key={adminEntry.id} className="admin-record-card">
                      <div className="admin-record-top">
                        <div>
                          <div className="admin-record-title">
                            {adminEntry.email || 'Email not set'}
                          </div>
                          <p className="admin-record-subtitle">User ID: {adminEntry.user_id}</p>
                          <p className="admin-record-copy" style={{ marginTop: '0.4rem' }}>
                            Added {new Date(adminEntry.created_at).toLocaleString()}
                          </p>
                        </div>
                        <StatusBadge
                          label={isCurrentUser ? 'Current account' : 'Admin'}
                          tone={isCurrentUser ? 'visible' : 'hidden'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Add admin user</h2>
                <p>Add a new portal admin using their Supabase Auth user ID.</p>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleAddAdminSubmit}>
              <AdminField
                label="Auth user ID"
                htmlFor="admin_user_id"
                description="Paste the user's UUID from Supabase Auth > Users."
                error={addAdminErrors.user_id}
              >
                <input
                  id="admin_user_id"
                  type="text"
                  className="admin-input"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={addAdminForm.user_id}
                  onChange={(event) => setAddAdminField('user_id', event.target.value)}
                />
              </AdminField>

              <AdminField
                label="Email (optional)"
                htmlFor="admin_user_email"
                error={addAdminErrors.email}
              >
                <input
                  id="admin_user_email"
                  type="email"
                  className="admin-input"
                  placeholder="owner@codecatalysts.dev"
                  value={addAdminForm.email}
                  onChange={(event) => setAddAdminField('email', event.target.value)}
                />
              </AdminField>

              <div className="admin-form-actions">
                <button type="submit" className="admin-button admin-button-primary" disabled={addingAdmin}>
                  <ShieldCheck size={16} />
                  <span>{addingAdmin ? 'Adding...' : 'Add admin user'}</span>
                </button>
              </div>
            </form>

            <div className="admin-card-header" style={{ marginTop: '1.15rem' }}>
              <div>
                <h2>Security</h2>
                <p>Change your password and manage the current session.</p>
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
