function toDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function formatAdminDateTime(value) {
  const date = toDate(value);
  if (!date) {
    return 'No timestamp';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatAdminRelativeTime(value) {
  const date = toDate(value);
  if (!date) {
    return 'No recent activity';
  }

  const diffMs = date.getTime() - Date.now();
  const absoluteSeconds = Math.round(Math.abs(diffMs) / 1000);
  const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absoluteSeconds < 60) {
    return relativeFormatter.format(Math.round(diffMs / 1000), 'second');
  }

  const absoluteMinutes = Math.round(absoluteSeconds / 60);
  if (absoluteMinutes < 60) {
    return relativeFormatter.format(Math.round(diffMs / (60 * 1000)), 'minute');
  }

  const absoluteHours = Math.round(absoluteMinutes / 60);
  if (absoluteHours < 24) {
    return relativeFormatter.format(Math.round(diffMs / (60 * 60 * 1000)), 'hour');
  }

  const absoluteDays = Math.round(absoluteHours / 24);
  if (absoluteDays < 30) {
    return relativeFormatter.format(Math.round(diffMs / (24 * 60 * 60 * 1000)), 'day');
  }

  return formatAdminDateTime(value);
}

export function formatBytes(bytes = 0) {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function escapeCsvValue(value) {
  const normalized = String(value ?? '');
  if (!/[",\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename, rows) {
  if (typeof window === 'undefined' || !Array.isArray(rows) || rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');

  link.href = downloadUrl;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
