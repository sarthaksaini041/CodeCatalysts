import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Milestone,
  Settings,
  SquareKanban,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { journeyAdminService, membersAdminService, projectsAdminService, siteSettingsAdminService } from '../../services/adminContentService';

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className="admin-stat-value">{value}</div>
      <p className="admin-record-copy" style={{ marginTop: '0.45rem' }}>{detail}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
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

        setSummary({ members, projects, journey, settings });
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

  const visibleMembers = summary.members.filter((item) => item.is_visible).length;
  const visibleProjects = summary.projects.filter((item) => item.is_visible).length;
  const visibleJourney = summary.journey.filter((item) => item.is_visible).length;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Admin Overview"
        description="A quick snapshot of the live content managed through Supabase."
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
            <StatCard
              icon={Users}
              label="Members"
              value={summary.members.length}
              detail={`${visibleMembers} visible, ${summary.members.length - visibleMembers} hidden`}
            />
            <StatCard
              icon={SquareKanban}
              label="Projects"
              value={summary.projects.length}
              detail={`${visibleProjects} visible, ${summary.projects.length - visibleProjects} hidden`}
            />
            <StatCard
              icon={Milestone}
              label="Journey Items"
              value={summary.journey.length}
              detail={`${visibleJourney} visible, ${summary.journey.length - visibleJourney} hidden`}
            />
            <StatCard
              icon={Settings}
              label="Hero Title"
              value={summary.settings?.hero_title ? 'Configured' : 'Fallback'}
              detail={summary.settings?.hero_title || 'Using the current frontend fallback value'}
            />
          </section>

          <section className="admin-grid">
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Publishing status</h2>
                    <p>Keep an eye on what the public website can currently see.</p>
                  </div>
                </div>

                <div className="admin-record-list">
                  {[
                    {
                      label: 'Members',
                      visible: visibleMembers,
                      hidden: summary.members.length - visibleMembers,
                      href: '/admin/members',
                    },
                    {
                      label: 'Projects',
                      visible: visibleProjects,
                      hidden: summary.projects.length - visibleProjects,
                      href: '/admin/projects',
                    },
                    {
                      label: 'Journey',
                      visible: visibleJourney,
                      hidden: summary.journey.length - visibleJourney,
                      href: '/admin/journey',
                    },
                  ].map((item) => (
                    <div key={item.label} className="admin-record-card">
                      <div className="admin-record-top">
                        <div>
                          <div className="admin-record-title">{item.label}</div>
                          <p className="admin-record-subtitle">
                            {item.visible} visible and {item.hidden} hidden items.
                          </p>
                        </div>
                        <Link to={item.href} className="admin-button admin-button-secondary">
                          Open
                        </Link>
                      </div>
                      <div className="admin-pill-row">
                        <span className="admin-pill"><Eye size={14} /> {item.visible} visible</span>
                        <span className="admin-pill"><EyeOff size={14} /> {item.hidden} hidden</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Quick links</h2>
                    <p>Jump straight into the main editing areas.</p>
                  </div>
                </div>

                <div className="admin-record-list">
                  <Link to="/admin/members" className="admin-record-card">
                    <div className="admin-record-title">Manage members</div>
                    <p className="admin-record-subtitle">Add new team cards, upload photos, and control visibility.</p>
                  </Link>
                  <Link to="/admin/projects" className="admin-record-card">
                    <div className="admin-record-title">Manage projects</div>
                    <p className="admin-record-subtitle">Publish live project cards, links, status, and featured highlights.</p>
                  </Link>
                  <Link to="/admin/journey" className="admin-record-card">
                    <div className="admin-record-title">Manage journey</div>
                    <p className="admin-record-subtitle">Update timeline milestones and reorder the story of the team.</p>
                  </Link>
                  <Link to="/admin/settings" className="admin-record-card">
                    <div className="admin-record-title">Edit site settings</div>
                    <p className="admin-record-subtitle">Control hero copy, footer text, and public contact links.</p>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
