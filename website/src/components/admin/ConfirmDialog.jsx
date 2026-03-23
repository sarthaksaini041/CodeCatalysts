import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  const cancelButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const rafId = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  const buttonClass = tone === 'danger'
    ? 'admin-button admin-button-danger'
    : 'admin-button admin-button-primary';

  if (typeof document === 'undefined') {
    return null;
  }

  const portalTarget = document.querySelector('.admin-shell') || document.body;

  return createPortal(
    <div className="admin-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-dialog-body">
          <h3 id={titleId}>{title}</h3>
          <p id={descriptionId}>{description}</p>
        </div>
        <div className="admin-dialog-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="admin-button admin-button-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button type="button" className={buttonClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
