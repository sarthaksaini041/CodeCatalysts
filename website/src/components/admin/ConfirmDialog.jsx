export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const buttonClass = tone === 'danger'
    ? 'admin-button admin-button-danger'
    : 'admin-button admin-button-primary';

  return (
    <div className="admin-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-dialog-body">
          <h3 id="admin-confirm-title">{title}</h3>
          <p>{description}</p>
        </div>
        <div className="admin-dialog-actions">
          <button type="button" className="admin-button admin-button-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={buttonClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
