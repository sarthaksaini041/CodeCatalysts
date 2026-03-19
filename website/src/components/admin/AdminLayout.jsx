import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleHelp,
  DoorOpen,
  Image,
  LayoutDashboard,
  Milestone,
  Search,
  SquareKanban,
  Settings,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getRecentAdminActivityCount, listAdminActivity } from '../../services/adminActivityService';
import AdminActivityRow from './AdminActivityRow';
import AdminNotice from './AdminNotice';

const CC_LOGO_PATH = "M349.00004,682.42774 c 27.6132,-4.01546 53.6308,-13.54456 79.0271,-28.9442 18.8469,-11.42825 19.1581,-11.69871 75.9729,-66.02338 35.7334,-34.16728 46.6642,-44.05234 56.1484,-50.77691 7.7963,-5.52772 21.8761,-12.30273 33.8516,-16.28889 10.8249,-3.60319 13.4439,-6.02164 12.6926,-11.72038 -0.7419,-5.62744 -5.3888,-9.55299 -16.5268,-13.96136 -30.0508,-11.89397 -67.7452,-15.02823 -91.7117,-7.62575 -7.9491,2.45525 -8.8455,3.20213 -43.1768,35.97496 -51.9637,49.60487 -57.7405,54.37042 -78.8497,65.04647 -26.7407,13.52422 -56.6901,16.83349 -85.7139,9.47099 -39.4608,-10.01006 -70.2017,-41.91138 -80.4311,-83.46724 -2.2718,-9.22908 -2.6034,-12.63202 -2.5449,-26.11205 0.059,-13.45911 0.4163,-16.81207 2.7174,-25.46483 9.2081,-34.62534 33.4969,-62.12492 67.2475,-76.13728 22.4194,-9.30797 51.0692,-10.94006 75.1228,-4.27951 16.2852,4.50946 34.1091,14.10538 48.3561,26.03362 l 4.8073,4.0249 4.0442,-3.20308 c 5.9458,-4.70913 52.2397,-49.25745 52.7274,-50.73918 0.5576,-1.69429 -12.2554,-14.87314 -22.5978,-23.24296 -20.657,-16.71714 -52.4027,-31.41578 -79.6626,-36.88474 -49.4938,-9.92957 -101.4605,-1.11442 -143.5,24.34203 -32.5065,19.68381 -59.3344,49.21421 -75.905,83.55103 -45.678802,94.65394 -6.4168,209.81818 87.5502,256.80427 25.2892,12.64529 46.3821,18.49903 77.8548,21.60638 7.2578,0.71658 31.8156,-0.4292 42.5,-1.98291 z m 313.3928,0.0846 c 51.1335,-7.78556 95.1485,-33.72244 127.0211,-74.85006 22.9334,-29.59276 35.9383,-63.7599 38.7882,-101.90654 3.4238,-45.82739 -8.0091,-88.45242 -34.2665,-127.7557 -6.2537,-9.36077 -11.6264,-15.79072 -21.3933,-25.60321 -20.357,-20.45205 -39.5117,-33.64703 -62.6336,-43.1462 -63.7134,-26.17539 -133.2676,-17.56162 -188.5969,23.35636 -7.798,5.76692 -31.2381,27.70252 -68.2981,63.91444 -30.5245,29.82591 -40.3163,37.39535 -62.5137,48.32527 -13.8136,6.80173 -26.5019,11.1533 -32.521,11.1533 -2.5551,0 -4.9249,0.27917 -5.2661,0.62039 -0.7471,0.74713 5.4459,10.7344 9.1443,14.74666 8.4269,9.14202 23.807,17.96839 37.6428,21.60246 17.9262,4.70848 35.1662,4.68542 54,-0.0722 16.4212,-4.14824 20.9399,-7.14583 42,-27.8619 50.9446,-50.11241 62.6477,-60.39846 80,-70.31342 9.9791,-5.70199 26.3453,-11.94427 37.5,-14.30294 10.0414,-2.12328 30.2698,-2.39962 39.7875,-0.54355 22.0185,4.29394 46.0361,17.44567 60.614,33.19152 31.4854,34.00805 38.9804,85.05696 18.7096,127.43303 -19.3173,40.38266 -62.5171,64.76429 -107.1598,60.48013 -22.7723,-2.18536 -41.0434,-9.60405 -60.7097,-24.65021 l -8.2584,-6.31826 -17.2416,16.68805 c -31.9572,30.93112 -36.8637,35.79154 -38.7733,38.40891 l -1.9032,2.60861 10.0284,8.86549 c 13.6871,12.09984 24.2926,19.47271 37.9065,26.35214 14.882,7.5203 28.1705,12.44333 43.319,16.04849 10.6451,2.53343 15.55,3.34651 32.681,5.41755 6.3409,0.76657 30.3168,-0.35444 40.3928,-1.8886 z";

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/members', label: 'Team', icon: Users },
  { to: '/admin/projects', label: 'Projects', icon: SquareKanban },
  { to: '/admin/journey', label: 'Journey', icon: Milestone },
  { to: '/admin/faqs', label: 'FAQs', icon: CircleHelp },
  { to: '/admin/media', label: 'Media', icon: Image },
  { to: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAdminAuth();
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const notificationRef = useRef(null);

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

  useEffect(() => {
    let isActive = true;

    async function loadInitialActivity() {
      setActivityLoading(true);
      setActivityError('');

      try {
        const nextItems = await listAdminActivity();

        if (isActive) {
          setActivityItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          setActivityError(error.message || 'Unable to load recent changes.');
        }
      } finally {
        if (isActive) {
          setActivityLoading(false);
        }
      }
    }

    loadInitialActivity();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!showActivityPanel) {
      return undefined;
    }

    let isActive = true;

    async function refreshActivity() {
      setActivityLoading(true);
      setActivityError('');

      try {
        const nextItems = await listAdminActivity();

        if (isActive) {
          setActivityItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          setActivityError(error.message || 'Unable to load recent changes.');
        }
      } finally {
        if (isActive) {
          setActivityLoading(false);
        }
      }
    }

    refreshActivity();

    return () => {
      isActive = false;
    };
  }, [showActivityPanel]);

  useEffect(() => {
    setShowActivityPanel(false);
  }, [location.pathname]);

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
            <Link to="/admin" className="admin-brand-mark" aria-label="Admin overview">
              <svg viewBox="108 254 722 430" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '19px' }}>
                <path d={CC_LOGO_PATH} />
              </svg>
            </Link>
            <span className="admin-brand-copy">CC Admin</span>
          </div>

          <div className="admin-sidebar-nav-area">
            <nav className="admin-nav" aria-label="Admin">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
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
            <label className="admin-topbar-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search team, projects, journey, media, or settings"
                aria-label="Search the admin portal"
              />
            </label>

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
                          to="/admin/activity"
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

              <Link to="/admin/account" className="admin-profile-card" aria-label="Open account settings">
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
        </main>
      </div>
    </div>
  );
}
