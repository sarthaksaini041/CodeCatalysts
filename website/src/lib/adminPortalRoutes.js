export const ADMIN_PORTAL_BASE_PATH = '/admin-portal';
export const LEGACY_ADMIN_BASE_PATH = '/admin';

export function adminPortalPath(path = '') {
  const normalizedPath = `${path}`.trim();

  if (!normalizedPath || normalizedPath === '/') {
    return ADMIN_PORTAL_BASE_PATH;
  }

  return `${ADMIN_PORTAL_BASE_PATH}/${normalizedPath.replace(/^\/+/, '')}`;
}

export function legacyAdminPath(path = '') {
  const normalizedPath = `${path}`.trim();

  if (!normalizedPath || normalizedPath === '/') {
    return LEGACY_ADMIN_BASE_PATH;
  }

  return `${LEGACY_ADMIN_BASE_PATH}/${normalizedPath.replace(/^\/+/, '')}`;
}

export const ADMIN_LOGIN_PATH = adminPortalPath('login');
export const ADMIN_RESET_PASSWORD_PATH = adminPortalPath('reset-password');
export const ADMIN_RECOVERY_PATH = adminPortalPath('recovery');
export const ADMIN_MEMBERS_PATH = adminPortalPath('members');
export const ADMIN_PROJECTS_PATH = adminPortalPath('projects');
export const ADMIN_JOURNEY_PATH = adminPortalPath('journey');
export const ADMIN_SECTIONS_PATH = adminPortalPath('sections');
export const ADMIN_FAQS_PATH = adminPortalPath('faqs');
export const ADMIN_MEDIA_PATH = adminPortalPath('media');
export const ADMIN_SETTINGS_PATH = adminPortalPath('settings');
export const ADMIN_APPLICATIONS_PATH = adminPortalPath('applications');
export const ADMIN_ACTIVITY_PATH = adminPortalPath('activity');
export const ADMIN_ACCOUNT_PATH = adminPortalPath('account');
