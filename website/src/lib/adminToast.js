export const ADMIN_TOAST_EVENT = 'admin:toast';

export function showAdminToast({
  title,
  message = '',
  tone = 'success',
  duration = 2800,
}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(ADMIN_TOAST_EVENT, {
    detail: {
      title: String(title || 'Done'),
      message: String(message || ''),
      tone,
      duration,
    },
  }));
}