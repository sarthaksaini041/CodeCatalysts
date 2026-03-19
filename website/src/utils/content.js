export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeOptionalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeOptionalEmail(value) {
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

export function parseListInput(value) {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((entry) => String(entry || '').trim())
          .filter(Boolean),
      ),
    );
  }

  return Array.from(
    new Set(
      String(value || '')
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );
}

export function formatListInput(value) {
  if (!Array.isArray(value) || !value.length) {
    return '';
  }

  return value.join(', ');
}

export function toDisplayOrder(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function moveItem(array, fromIndex, toIndex) {
  const next = [...array];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function normalizeNullableString(value) {
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

export function validateOptionalUrl(value, label) {
  if (!value) {
    return '';
  }

  return normalizeOptionalUrl(value) ? '' : `${label} must be a valid URL starting with http:// or https://.`;
}
