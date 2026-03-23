import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Clock3,
  Eye,
  Milestone,
  SquareKanban,
  Users,
} from 'lucide-react';
import AdminActivityRow from '../../components/admin/AdminActivityRow';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  journeyAdminService,
  membersAdminService,
  projectsAdminService,
  siteSettingsAdminService,
} from '../../services/adminContentService';
import {
  createAdminActivityEntries,
  getRecentAdminActivityCount,
} from '../../services/adminActivityService';
import { getAdminDisplayName } from '../../utils/adminProfile';
import {
  ADMIN_ACTIVITY_PATH,
  ADMIN_JOURNEY_PATH,
  ADMIN_MEMBERS_PATH,
  ADMIN_PROJECTS_PATH,
  ADMIN_SETTINGS_PATH,
} from '../../lib/adminPortalRoutes';

const QUICK_ACTIONS = [
  {
    to: ADMIN_MEMBERS_PATH,
    label: 'Add member',
    description: 'Update the public team lineup and profile details.',
  },
  {
    to: ADMIN_PROJECTS_PATH,
    label: 'Add project',
    description: 'Publish a new project card with links and visibility controls.',
  },
  {
    to: ADMIN_JOURNEY_PATH,
    label: 'Add journey entry',
    description: 'Capture a new milestone in the public timeline.',
  },
  {
    to: ADMIN_SETTINGS_PATH,
    label: 'Edit site settings',
    description: 'Adjust hero copy, CTA text, and footer brand links.',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    members: [],
    projects: [],
    journey: [],
    settings: null,
  });

  useEffect(() => {
    let isActive = true;

    async function loadSummary() {
      setLoading(true);
      setError('');

      try {
        const [members, projects, journey, settings] = await Promise.all([
          membersAdminService.list(),
          projectsAdminService.list(),
          journeyAdminService.list(),
          siteSettingsAdminService.get(),
        ]);

        if (isActive) {
          setSummary({
            members,
            projects,
            journey,
            settings,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadSummary();
    return () => {
      isActive = false;
    };
  }, []);

  const adminName = getAdminDisplayName(user);

  const visibilitySummary = useMemo(() => {
    const allItems = [
      ...summary.members,
      ...summary.projects,
      ...summary.journey,
    ];

    const visible = allItems.filter((item) => item.is_visible).length;
    return {
      visible,
      hidden: allItems.length - visible,
      total: allItems.length,
    };
  }, [summary.journey, summary.members, summary.projects]);

  const allActivity = useMemo(
    () => createAdminActivityEntries({
      members: summary.members,
      projects: summary.projects,
      journey: summary.journey,
      settings: summary.settings,
    }),
    [summary.journey, summary.members, summary.projects, summary.settings],
  );

  const recentUpdateCount = useMemo(
    () => getRecentAdminActivityCount(allActivity),
    [allActivity],
  );

  const recentActivity = useMemo(
    () => allActivity.slice(0, 5),
    [allActivity],
  );

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={`Hello, ${adminName}`}
        description="Monitor content health, visibility, and recent publishing activity from one responsive dashboard."
        actions={(
          <Link to={ADMIN_ACTIVITY_PATH} className="admin-button admin-button-secondary">
            <ArrowUpRight size={16} />
            <span>Open activity log</span>
          </Link>
        )}
      />

      {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}

      {loading ? (
        <div className="admin-loading">
          <div>
            <div className="admin-loading-spinner" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <section className="admin-card admin-dashboard-hero">
            <div className="admin-card-body">
              <div className="admin-dashboard-hero-copy">
                <span className="admin-page-kicker">Portal overview</span>
                <h2>Everything important is visible at a glance.</h2>
                <p>
                  Track publishing volume, content visibility, and the latest changes
                  without hopping between screens.
                </p>
              </div>

              <div className="admin-stats">
                <AdminStatCard
                  icon={Users}
                  label="Total members"
                  value={summary.members.length}
                  description="Profiles in the team directory"
                  featured
                />
                <AdminStatCard
                  icon={SquareKanban}
                  label="Total projects"
                  value={summary.projects.length}
                  description="Public-facing project cards"
                />
                <AdminStatCard
                  icon={Milestone}
                  label="Journey entries"
                  value={summary.journey.length}
                  description="Timeline milestones on the site"
                />
                <AdminStatCard
                  icon={Eye}
                  label="Visible content"
                  value={`${visibilitySummary.visible}/${visibilitySummary.total || 0}`}
                  description={`${visibilitySummary.hidden} hidden item${visibilitySummary.hidden === 1 ? '' : 's'} kept in reserve`}
                />
                <AdminStatCard
                  icon={Clock3}
                  label="Recent updates"
                  value={recentUpdateCount}
                  description="Changes made in the last 7 days"
                />
              </div>
            </div>
          </section>

          <section className="admin-dashboard-grid">
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Quick actions</h2>
                    <p>Jump straight into the most common admin tasks.</p>
                  </div>
                </div>

                <div className="admin-quick-actions-grid">
                  {QUICK_ACTIONS.map((item) => (
                    <Link key={item.to} to={item.to} className="admin-quick-action">
                      <span>
                        <strong>{item.label}</strong>
                        <span className="admin-quick-action-copy">{item.description}</span>
                      </span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Latest activity</h2>
                    <p>The newest publishing changes across managed content.</p>
                  </div>
                  <Link to={ADMIN_ACTIVITY_PATH} className="admin-button admin-button-ghost">
                    <span>View all</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                {recentActivity.length === 0 ? (
                  <AdminNotice tone="empty">No activity has been recorded yet.</AdminNotice>
                ) : (
                  <div className="admin-record-list">
                    {recentActivity.map((item) => (
                      <AdminActivityRow key={`${item.type}-${item.id}`} item={item} compact />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
