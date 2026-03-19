import { useEffect, useMemo } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';

export default function ImageUploadField({
  label,
  currentUrl,
  file,
  error,
  helpText,
  onFileChange,
  onClearSelection,
}) {
  const inputId = useMemo(
    () => `${String(label || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-upload`,
    [label],
  );
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  const resolvedPreviewUrl = previewUrl || currentUrl || '';

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  return (
    <div className="admin-upload">
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <strong>{label}</strong>
        {helpText ? <span className="admin-field-copy">{helpText}</span> : null}
      </div>

      <div className="admin-upload-preview">
        {resolvedPreviewUrl ? (
          <img src={resolvedPreviewUrl} alt={`${label} preview`} />
        ) : (
          <div className="admin-upload-placeholder">
            <div>
              <ImagePlus size={26} style={{ marginBottom: '0.7rem' }} />
              <p>Upload a JPG, PNG, WEBP, or GIF image up to 5 MB.</p>
            </div>
          </div>
        )}
      </div>

      <div className="admin-upload-actions">
        <label className="admin-button admin-button-secondary" htmlFor={inputId}>
          <Upload size={16} />
          <span>{file ? 'Replace image' : 'Choose image'}</span>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />

        {(file || currentUrl) ? (
          <button type="button" className="admin-button admin-button-ghost" onClick={onClearSelection}>
            <Trash2 size={16} />
            <span>Clear selection</span>
          </button>
        ) : null}
      </div>

      {error ? <div className="admin-field-error">{error}</div> : null}
    </div>
  );
}
