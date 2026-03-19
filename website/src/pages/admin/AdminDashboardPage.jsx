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

const QUICK_ACTIONS = [
  { to: '/admin/members', label: 'Add Member' },
  { to: '/admin/projects', label: 'Add Project' },
  { to: '/admin/journey', label: 'Add Journey Card' },
  { to: '/admin/settings', label: 'Edit Site Settings' },
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

        if (!isActive) {
          return;
        }

        setSummary({
          members,
          projects,
          journey,
          settings,
        });
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

  const allActivity = useMemo(() => {
    return createAdminActivityEntries({
      members: summary.members,
      projects: summary.projects,
      journey: summary.journey,
      settings: summary.settings,
    });
  }, [summary.journey, summary.members, summary.projects, summary.settings]);

  const recentUpdateCount = useMemo(() => {
    return getRecentAdminActivityCount(allActivity);
  }, [allActivity]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={`Hello, ${adminName}`}
        description="A clear view of your content, visibility, recent edits, and the fastest ways to make changes."
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
          <section className="admin-stats">
            <AdminStatCard
              icon={Users}
              label="Total Members"
              value={summary.members.length}
              featured
            />
            <AdminStatCard
              icon={SquareKanban}
              label="Total Projects"
              value={summary.projects.length}
            />
            <AdminStatCard
              icon={Milestone}
              label="Journey Entries"
              value={summary.journey.length}
            />
            <AdminStatCard
              icon={Eye}
              label="Visible vs Hidden"
              value={`${visibilitySummary.visible}/${visibilitySummary.total || 0}`}
            />
            <AdminStatCard
              icon={Clock3}
              label="Recent Updates"
              value={recentUpdateCount}
            />
          </section>

          <section className="admin-card">
            <div className="admin-card-body">
              <div className="admin-card-header">
                <div>
                  <h2>Quick actions</h2>
                  <p>Open the most common admin tasks.</p>
                </div>
              </div>

              <div className="admin-page-toolbar">
                {QUICK_ACTIONS.map((item) => (
                  <Link key={item.to} to={item.to} className="admin-button admin-button-secondary">
                    <span>{item.label}</span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
