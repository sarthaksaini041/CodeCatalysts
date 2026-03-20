import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  DoorOpen,
  Image,
  LayoutDashboard,
  Milestone,
  Search,
  SquareKanban,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getRecentAdminActivityCount, listAdminActivity } from '../../services/adminActivityService';
import AdminActivityRow from './AdminActivityRow';
import AdminNotice from './AdminNotice';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../../lib/brandAssets';
import { ADMIN_TOAST_EVENT } from '../../lib/adminToast';
import {
  ADMIN_ACCOUNT_PATH,
  ADMIN_ACTIVITY_PATH,
  ADMIN_APPLICATIONS_PATH,
  ADMIN_FAQS_PATH,
  ADMIN_JOURNEY_PATH,
  ADMIN_MEDIA_PATH,
  ADMIN_MEMBERS_PATH,
  ADMIN_PORTAL_BASE_PATH,
  ADMIN_PROJECTS_PATH,
  ADMIN_SETTINGS_PATH,
} from '../../lib/adminPortalRoutes';

const navItems = [
  { to: ADMIN_PORTAL_BASE_PATH, label: 'Dashboard', icon: LayoutDashboard },
  { to: ADMIN_MEMBERS_PATH, label: 'Team', icon: Users },
  { to: ADMIN_PROJECTS_PATH, label: 'Projects', icon: SquareKanban },
  { to: ADMIN_JOURNEY_PATH, label: 'Journey', icon: Milestone },
  { to: ADMIN_FAQS_PATH, label: 'FAQs', icon: CircleHelp },
  { to: ADMIN_APPLICATIONS_PATH, label: 'Applications', icon: ClipboardList },
  { to: ADMIN_MEDIA_PATH, label: 'Media', icon: Image },
  { to: ADMIN_SETTINGS_PATH, label: 'Site Settings', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAdminAuth();
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [toast, setToast] = useState(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date()),
    [],
  );
  const recentChangeCount = useMemo(
    () => getRecentAdminActivityCount(activityItems),
    [activityItems],
  );
  const recentChangesPreview = useMemo(
    () => activityItems.slice(0, 5),
    [activityItems],
  );
  const sectionSearchItems = useMemo(() => ([
    { id: 'section-dashboard', title: 'Dashboard', description: 'Overview and quick actions', href: ADMIN_PORTAL_BASE_PATH, type: 'Section', keywords: ['home', 'overview', 'dashboard'] },
    { id: 'section-team', title: 'Team', description: 'Manage members', href: ADMIN_MEMBERS_PATH, type: 'Section', keywords: ['members', 'team'] },
    { id: 'section-projects', title: 'Projects', description: 'Manage projects', href: ADMIN_PROJECTS_PATH, type: 'Section', keywords: ['projects'] },
    { id: 'section-journey', title: 'Journey', description: 'Manage timeline entries', href: ADMIN_JOURNEY_PATH, type: 'Section', keywords: ['journey', 'timeline'] },
    { id: 'section-faqs', title: 'FAQs', description: 'Manage frequently asked questions', href: ADMIN_FAQS_PATH, type: 'Section', keywords: ['faq', 'questions'] },
    { id: 'section-applications', title: 'Applications', description: 'View apply form submissions', href: ADMIN_APPLICATIONS_PATH, type: 'Section', keywords: ['applications', 'apply', 'submissions'] },
    { id: 'section-media', title: 'Media', description: 'Manage images and assets', href: ADMIN_MEDIA_PATH, type: 'Section', keywords: ['media', 'images', 'assets'] },
    { id: 'section-settings', title: 'Site Settings', description: 'Update site-wide settings', href: ADMIN_SETTINGS_PATH, type: 'Section', keywords: ['settings', 'site settings'] },
    { id: 'section-activity', title: 'Activity', description: 'Recent portal changes', href: ADMIN_ACTIVITY_PATH, type: 'Section', keywords: ['activity', 'recent'] },
    { id: 'section-account', title: 'Account', description: 'Account and admin access', href: ADMIN_ACCOUNT_PATH, type: 'Section', keywords: ['account', 'profile', 'admin users'] },
  ]), []);

  const activitySearchItems = useMemo(
    () => activityItems.slice(0, 12).map((item) => ({
      id: `activity-${item.type}-${item.id}`,
      title: item.title,
      description: item.description,
      href: item.href,
      type: item.type,
      keywords: [item.type, item.description],
    })),
    [activityItems],
  );

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const merged = [...sectionSearchItems, ...activitySearchItems];

    if (!query) {
      return sectionSearchItems.slice(0, 7);
    }

    return merged
      .filter((item) => {
        const haystack = [item.title, item.description, ...(item.keywords || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [activitySearchItems, searchQuery, sectionSearchItems]);

  const handleSearchSelect = useCallback((item) => {
    if (!item?.href) {
      return;
    }

    navigate(item.href);
    setShowSearchResults(false);
    setSearchQuery('');
  }, [navigate]);

  const refreshActivity = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setActivityLoading(true);
    }

    setActivityError('');

    try {
      const nextItems = await listAdminActivity();
      setActivityItems(nextItems);
    } catch (error) {
      setActivityError(error.message || 'Unable to load recent changes.');
    } finally {
      if (showLoading) {
        setActivityLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshActivity({ showLoading: true });
  }, [refreshActivity]);

  useEffect(() => {
    if (!showActivityPanel) {
      return undefined;
    }

    refreshActivity({ showLoading: true });
    return undefined;
  }, [refreshActivity, showActivityPanel]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshActivity({ showLoading: false });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshActivity]);

  useEffect(() => {
    function handleFocus() {
      refreshActivity({ showLoading: false });
    }

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshActivity]);

  useEffect(() => {
    function handleToast(event) {
      const detail = event.detail || {};
      setToast({
        title: detail.title || 'Done',
        message: detail.message || '',
        tone: detail.tone || 'success',
        duration: Number(detail.duration) > 0 ? Number(detail.duration) : 2800,
      });
    }

    window.addEventListener(ADMIN_TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(ADMIN_TOAST_EVENT, handleToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, toast.duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    setShowActivityPanel(false);
    setShowSearchResults(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!showActivityPanel) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowActivityPanel(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowActivityPanel(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showActivityPanel]);

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-top">
            <Link to={ADMIN_PORTAL_BASE_PATH} className="admin-brand-mark" aria-label="Admin overview">
              <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="admin-brand-image" />
            </Link>
            <span className="admin-brand-copy">CC Admin</span>
          </div>

          <div className="admin-sidebar-nav-area">
            <nav className="admin-nav" aria-label="Admin">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === ADMIN_PORTAL_BASE_PATH}
                  aria-label={label}
                  title={label}
                  className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
                >
                  <span className="admin-nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="admin-nav-link-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-search-wrap" ref={searchRef}>
              <label className="admin-topbar-search">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search team, projects, journey, media, or settings"
                  aria-label="Search the admin portal"
                  value={searchQuery}
                  onFocus={() => setShowSearchResults(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setShowSearchResults(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (searchResults.length > 0) {
                        handleSearchSelect(searchResults[0]);
                      }
                    }

                    if (event.key === 'Escape') {
                      setShowSearchResults(false);
                    }
                  }}
                />
              </label>

              {showSearchResults ? (
                <div className="admin-search-results" role="listbox" aria-label="Search suggestions">
                  {searchResults.length === 0 ? (
                    <div className="admin-search-empty">No matching sections or updates.</div>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="admin-search-result-item"
                        onClick={() => handleSearchSelect(item)}
                      >
                        <span className="admin-search-result-title">{item.title}</span>
                        <span className="admin-search-result-meta">{item.type} • {item.description}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>

            <div className="admin-topbar-meta">
              <span className="admin-date-chip">
                <CalendarDays size={15} />
                <span>Today, {todayLabel}</span>
              </span>

              <div className="admin-control-group">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="admin-icon-button"
                  aria-label="Preview website"
                  title="Preview website"
                >
                  <ArrowUpRight size={16} />
                </a>
                <div className="admin-notification-shell" ref={notificationRef}>
                  <button
                    type="button"
                    className="admin-icon-button"
                    aria-label="Recent changes"
                    aria-expanded={showActivityPanel}
                    onClick={() => setShowActivityPanel((current) => !current)}
                  >
                    <Bell size={16} />
                    {recentChangeCount > 0 ? (
                      <span className="admin-icon-badge">{recentChangeCount > 9 ? '9+' : recentChangeCount}</span>
                    ) : null}
                  </button>

                  {showActivityPanel ? (
                    <div className="admin-notification-panel" role="dialog" aria-label="Recent changes panel">
                      <div className="admin-notification-panel-header">
                        <div>
                          <div className="admin-notification-title">Recent changes</div>
                          <p>Latest updates across the portal.</p>
                        </div>
                        <Link
                          to={ADMIN_ACTIVITY_PATH}
                          className="admin-notification-link"
                          onClick={() => setShowActivityPanel(false)}
                        >
                          Show all
                        </Link>
                      </div>

                      {activityLoading ? (
                        <div className="admin-notification-loading">
                          <div className="admin-loading-spinner" />
                          <p>Loading recent changes...</p>
                        </div>
                      ) : activityError ? (
                        <AdminNotice tone="error">{activityError}</AdminNotice>
                      ) : recentChangesPreview.length === 0 ? (
                        <AdminNotice tone="empty">No recent changes yet.</AdminNotice>
                      ) : (
                        <div className="admin-record-list">
                          {recentChangesPreview.map((item) => (
                            <AdminActivityRow
                              key={`${item.type}-${item.id}`}
                              item={item}
                              compact
                              onClick={() => setShowActivityPanel(false)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <Link to={ADMIN_ACCOUNT_PATH} className="admin-profile-card" aria-label="Open account settings">
                <div className="admin-avatar" aria-hidden="true">
                  A
                </div>
                <div className="admin-profile-copy">
                  <div className="admin-profile-name">Admin</div>
                </div>
              </Link>

              <button
                type="button"
                className="admin-icon-button admin-topbar-logout"
                onClick={signOut}
                aria-label="Log out"
                title="Log out"
              >
                <DoorOpen size={18} />
              </button>
            </div>
          </div>

          <div className="admin-main-panel">
            <Outlet />
          </div>

          {toast ? (
            <div className="admin-toast-container" aria-live="polite" aria-atomic="true">
              <div className={`admin-toast admin-toast-${toast.tone}`} role="status">
                <div className="admin-toast-content">
                  <div className="admin-toast-title">{toast.title}</div>
                  {toast.message ? <p>{toast.message}</p> : null}
                </div>
                <button
                  type="button"
                  className="admin-toast-close"
                  onClick={() => setToast(null)}
                  aria-label="Close notification"
                  title="Close notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
