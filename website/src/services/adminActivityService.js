import {
  journeyAdminService,
  membersAdminService,
  projectsAdminService,
  siteSettingsAdminService,
} from './adminContentService';

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
        href: '/admin/members',
      };
    }

    if (type === 'projects') {
      return {
        id: record.id,
        type: 'Project',
        title: record.title || 'Untitled project',
        description: record.status || record.category || 'Project details updated',
        timestamp,
        href: '/admin/projects',
      };
    }

    if (type === 'journey') {
      return {
        id: record.id,
        type: 'Journey',
        title: record.title || 'Untitled entry',
        description: record.date_label || 'Timeline entry updated',
        timestamp,
        href: '/admin/journey',
      };
    }

    return {
      id: record.id,
      type: 'Content',
      title: record.title || record.name || 'Updated item',
      description: 'Website content updated',
      timestamp,
      href: '/admin',
    };
  });
}

export function createAdminActivityEntries({
  members = [],
  projects = [],
  journey = [],
  settings = null,
} = {}) {
  const entries = [
    ...mapActivityRecords(members, 'team'),
    ...mapActivityRecords(projects, 'projects'),
    ...mapActivityRecords(journey, 'journey'),
  ];

  if (settings?.updated_at) {
    entries.push({
      id: 'site-settings',
      type: 'Settings',
      title: settings.hero_title || 'Site settings',
      description: 'Hero and footer settings updated',
      timestamp: settings.updated_at,
      href: '/admin/settings',
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
  const [members, projects, journey, settings] = await Promise.all([
    membersAdminService.list(),
    projectsAdminService.list(),
    journeyAdminService.list(),
    siteSettingsAdminService.get(),
  ]);

  return createAdminActivityEntries({
    members,
    projects,
    journey,
    settings,
  });
}
