function formatAdminWords(value) {
  const words = String(value || '')
    .trim()
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const cleanWords = words.filter((part) => /^[a-zA-Z]+$/.test(part));
  const preferredWords = cleanWords.length ? cleanWords.slice(0, 2) : words.slice(0, 1);

  if (!preferredWords.length) {
    return '';
  }

  return preferredWords
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function pickMetadataUsername(user) {
  return [
    user?.user_metadata?.username,
    user?.user_metadata?.user_name,
    user?.user_metadata?.preferred_username,
  ].find((value) => typeof value === 'string' && value.trim());
}

function getEmailLocalPart(user) {
  return String(user?.email || '').split('@')[0]?.trim() || '';
}

export function getAdminDisplayName(user) {
  const metadataName = [
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    user?.user_metadata?.display_name,
  ].find((value) => typeof value === 'string' && value.trim());

  if (metadataName) {
    return metadataName.trim();
  }

  const usernameLabel = formatAdminWords(pickMetadataUsername(user));
  if (usernameLabel) {
    return usernameLabel;
  }

  const emailLabel = formatAdminWords(getEmailLocalPart(user));
  return emailLabel || 'Admin';
}

export function humanizeAdminUsername(value) {
  return formatAdminWords(value) || 'Admin';
}

export function getAdminUsername(user) {
  const username = pickMetadataUsername(user) || getEmailLocalPart(user);
  return username || 'admin';
}

export function normalizeAdminDisplayName(value) {
  return String(value || '').trim();
}

export function normalizeAdminUsername(value) {
  return String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function validateAdminDisplayName(value) {
  const displayName = normalizeAdminDisplayName(value);

  if (!displayName) {
    return '';
  }

  if (displayName.length > 48) {
    return 'Use 48 characters or fewer.';
  }

  return '';
}

export function validateAdminUsername(value) {
  const username = normalizeAdminUsername(value);

  if (!username) {
    return 'Username is required.';
  }

  if (username.length < 3) {
    return 'Use at least 3 characters.';
  }

  if (username.length > 32) {
    return 'Use 32 characters or fewer.';
  }

  if (!/^[a-z0-9._-]+$/.test(username)) {
    return 'Use letters, numbers, dots, underscores, or hyphens.';
  }

  return '';
}
