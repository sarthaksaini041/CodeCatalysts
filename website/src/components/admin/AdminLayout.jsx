import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  DoorOpen,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Milestone,
  Settings,
  SquareKanban,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
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
  ADMIN_SECTIONS_PATH,
  ADMIN_SETTINGS_PATH,
} from '../../lib/adminPortalRoutes';
import { listAdminActivity, getRecentAdminActivityCount } from '../../services/adminActivityService';
import { getAdminDisplayName } from '../../utils/adminProfile';

const SIDEBAR_COLLAPSED_KEY = 'codecatalysts-admin-sidebar-collapsed';

const navItems = [
  {
    to: ADMIN_PORTAL_BASE_PATH,
    label: 'Dashboard',
    description: 'Snapshot and quick actions',
    icon: LayoutDashboard,
  },
  {
    to: ADMIN_MEMBERS_PATH,
    label: 'Team',
    description: 'Profiles and ordering',
    icon: Users,
  },
  {
    to: ADMIN_PROJECTS_PATH,
    label: 'Projects',
    description: 'Cards, links, and featured work',
    icon: SquareKanban,
  },
  {
    to: ADMIN_JOURNEY_PATH,
    label: 'Journey',
    description: 'Timeline content',
    icon: Milestone,
  },
  {
    to: ADMIN_SECTIONS_PATH,
    label: 'Sections',
    description: 'Reusable page sections',
    icon: LayoutTemplate,
  },
  {
    to: ADMIN_FAQS_PATH,
    label: 'FAQs',
    description: 'Questions before applicants apply',
    icon: CircleHelp,
  },
  {
    to: ADMIN_APPLICATIONS_PATH,
    label: 'Applications',
    description: 'Inbound submissions',
    icon: ClipboardList,
  },
  {
    to: ADMIN_MEDIA_PATH,
    label: 'Media',
    description: 'Shared asset library',
    icon: Image,
  },
  {
    to: ADMIN_SETTINGS_PATH,
    label: 'Settings',
    description: 'Public copy and brand links',
    icon: Settings,
  },
];

function getStoredSidebarState() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function AdminLayout() {
  const location = useLocation();
  const { signOut, user } = useAdminAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getStoredSidebarState);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [toast, setToast] = useState(null);
  const notificationRef = useRef(null);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date()),
    [],
  );

  const adminName = getAdminDisplayName(user);

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
      if (document.visibilityState === 'visible') {
        refreshActivity({ showLoading: false });
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
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
    return () => window.removeEventListener(ADMIN_TOAST_EVENT, handleToast);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), toast.duration);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    setShowActivityPanel(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
    } catch {
      // Ignore local storage access issues and keep the in-memory preference.
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    function handlePointerDown(event) {
      const target = event.target;

      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowActivityPanel(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowActivityPanel(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const recentChangeCount = useMemo(
    () => getRecentAdminActivityCount(activityItems),
    [activityItems],
  );

  const recentChangesPreview = useMemo(
    () => activityItems.slice(0, 5),
    [activityItems],
  );

  return (
    <div className={`admin-shell${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-sidebar-top">
            <Link to={ADMIN_PORTAL_BASE_PATH} className="admin-brand" aria-label="Admin overview">
              <span className="admin-brand-mark">
                <img
                  src={SITE_LOGO_SRC}
                  alt={SITE_LOGO_ALT}
                  className="admin-brand-image"
                  loading="eager"
                  decoding="async"
                />
              </span>
              <span className="admin-brand-copy">
                <strong>Code Catalysts</strong>
                <span>Admin portal</span>
              </span>
            </Link>

            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              <span>{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          </div>

          <div className="admin-sidebar-nav-area">
            <nav className="admin-nav">
              {navItems.map(({ to, label, description, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === ADMIN_PORTAL_BASE_PATH}
                  className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
                >
                  <span className="admin-nav-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="admin-sidebar-link-copy">
                    <span className="admin-sidebar-link-label">{label}</span>
                    <span className="admin-sidebar-link-meta">{description}</span>
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-meta">
              <div className="admin-date-chip">
                <CalendarDays size={16} aria-hidden="true" />
                <span>{todayLabel}</span>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-mini-chip"
              >
                <span>Open website</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>

              <div ref={notificationRef} className="admin-notification-shell">
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => setShowActivityPanel((current) => !current)}
                  aria-expanded={showActivityPanel}
                  aria-label="Recent changes"
                >
                  <Bell size={18} />
                  {recentChangeCount > 0 ? (
                    <span className="admin-icon-badge">
                      {recentChangeCount > 9 ? '9+' : recentChangeCount}
                    </span>
                  ) : null}
                </button>

                {showActivityPanel ? (
                  <div className="admin-notification-panel">
                    <div className="admin-notification-panel-header">
                      <div>
                        <div className="admin-notification-title">Recent changes</div>
                        <p>Stay on top of new edits, uploads, and application updates.</p>
                      </div>
                      <Link
                        to={ADMIN_ACTIVITY_PATH}
                        className="admin-notification-link"
                        onClick={() => setShowActivityPanel(false)}
                      >
                        View all
                      </Link>
                    </div>

                    {activityLoading ? (
                      <div className="admin-notification-loading">
                        <div className="admin-loading-spinner" />
                        <div>Loading the latest activity...</div>
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

              <Link to={ADMIN_ACCOUNT_PATH} className="admin-profile-card admin-profile-card-topbar">
                <span className="admin-avatar">{adminName.slice(0, 1)}</span>
                <span className="admin-profile-copy">
                  <span className="admin-profile-name">{adminName}</span>
                  <span className="admin-profile-role">Verified admin</span>
                </span>
              </Link>

              <button
                type="button"
                className="admin-icon-button admin-topbar-logout"
                onClick={signOut}
                aria-label="Log out"
              >
                <DoorOpen size={18} />
              </button>
            </div>
          </div>

          <div className="admin-main-panel">
            <Outlet />
          </div>
        </div>
      </div>

      {toast ? (
        <div className="admin-toast-container">
          <div className={`admin-toast admin-toast-${toast.tone}`}>
            <div className="admin-toast-content">
              <strong className="admin-toast-title">{toast.title}</strong>
              {toast.message ? <p>{toast.message}</p> : null}
            </div>
            <button
              type="button"
              className="admin-toast-close"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
