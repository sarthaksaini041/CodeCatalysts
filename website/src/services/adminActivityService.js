import {
  applicationsAdminService,
  journeyAdminService,
  membersAdminService,
  projectsAdminService,
  siteSettingsAdminService,
} from './adminContentService';
import {
  ADMIN_APPLICATIONS_PATH,
  ADMIN_JOURNEY_PATH,
  ADMIN_MEMBERS_PATH,
  ADMIN_PORTAL_BASE_PATH,
  ADMIN_PROJECTS_PATH,
  ADMIN_SETTINGS_PATH,
} from '../lib/adminPortalRoutes';

function mapActivityRecords(records, type) {
  return records.map((record) => {
    const timestamp = record.updated_at || record.created_at;

    if (type === 'team') {
      return {
        id: record.id,
        type: 'Team',
        title: record.name || 'Untitled member',
        description: record.role || 'Member details updated',
        timestamp,
        href: ADMIN_MEMBERS_PATH,
      };
    }

    if (type === 'projects') {
      return {
        id: record.id,
        type: 'Project',
        title: record.title || 'Untitled project',
        description: record.status || record.category || 'Project details updated',
        timestamp,
        href: ADMIN_PROJECTS_PATH,
      };
    }

    if (type === 'journey') {
      return {
        id: record.id,
        type: 'Journey',
        title: record.title || 'Untitled entry',
        description: record.date_label || 'Timeline entry updated',
        timestamp,
        href: ADMIN_JOURNEY_PATH,
      };
    }

    if (type === 'applications') {
      return {
        id: record.id,
        type: 'Application',
        title: record.name || record.email || 'New application',
        description: record.domain
          ? `Applied for ${record.domain}`
          : 'New application submitted',
        timestamp,
        href: ADMIN_APPLICATIONS_PATH,
      };
    }

    return {
      id: record.id,
      type: 'Content',
      title: record.title || record.name || 'Updated item',
      description: 'Website content updated',
      timestamp,
      href: ADMIN_PORTAL_BASE_PATH,
    };
  });
}

export function createAdminActivityEntries({
  members = [],
  projects = [],
  journey = [],
  applications = [],
  settings = null,
} = {}) {
  const entries = [
    ...mapActivityRecords(members, 'team'),
    ...mapActivityRecords(projects, 'projects'),
    ...mapActivityRecords(journey, 'journey'),
    ...mapActivityRecords(applications, 'applications'),
  ];

  if (settings?.updated_at) {
    entries.push({
      id: 'site-settings',
      type: 'Settings',
      title: settings.hero_title || 'Site settings',
      description: 'Hero and footer settings updated',
      timestamp: settings.updated_at,
      href: ADMIN_SETTINGS_PATH,
    });
  }

  return entries
    .filter((item) => item.timestamp)
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

export function getRecentAdminActivityCount(entries, days = 7) {
  const threshold = Date.now() - (days * 24 * 60 * 60 * 1000);
  return entries.filter((item) => new Date(item.timestamp).getTime() >= threshold).length;
}

export async function listAdminActivity() {
  const [members, projects, journey, applications, settings] = await Promise.all([
    membersAdminService.list(),
    projectsAdminService.list(),
    journeyAdminService.list(),
    applicationsAdminService.list(),
    siteSettingsAdminService.get(),
  ]);

  return createAdminActivityEntries({
    members,
    projects,
    journey,
    applications,
    settings,
  });
}
