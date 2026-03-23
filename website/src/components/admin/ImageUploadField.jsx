import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Library, Search, Trash2, Upload } from 'lucide-react';

export default function ImageUploadField({
  label,
  currentUrl,
  file,
  error,
  helpText,
  existingMedia = [],
  loadingMedia = false,
  mediaError = '',
  onFileChange,
  onClearSelection,
  onSelectExisting,
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const deferredLibraryQuery = useDeferredValue(libraryQuery);
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

  const filteredMedia = useMemo(() => {
    const normalizedQuery = deferredLibraryQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return existingMedia;
    }

    return existingMedia.filter((item) => {
      const haystack = `${item.name} ${item.path} ${item.collection || ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [deferredLibraryQuery, existingMedia]);

  return (
    <div className="admin-upload">
      <div className="admin-upload-header">
        <strong className="admin-upload-title">{label}</strong>
        {helpText ? <span className="admin-field-copy">{helpText}</span> : null}
      </div>

      <div className={`admin-upload-preview${resolvedPreviewUrl ? ' is-filled' : ''}`}>
        {resolvedPreviewUrl ? (
          <img
            src={resolvedPreviewUrl}
            alt={`${label} preview`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="admin-upload-placeholder">
            <div>
              <ImagePlus size={26} className="admin-upload-icon" />
              <p>Upload a JPG, PNG, WEBP, or GIF up to 5 MB.</p>
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
          className="admin-hidden-input"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />

        {(file || currentUrl) ? (
          <button type="button" className="admin-button admin-button-ghost" onClick={onClearSelection}>
            <Trash2 size={16} />
            <span>Clear selection</span>
          </button>
        ) : null}

        {onSelectExisting ? (
          <button
            type="button"
            className="admin-button admin-button-ghost"
            onClick={() => {
              if (showLibrary) {
                setLibraryQuery('');
              }
              setShowLibrary((current) => !current);
            }}
          >
            <Library size={16} />
            <span>{showLibrary ? 'Hide media library' : 'Reuse existing'}</span>
          </button>
        ) : null}
      </div>

      {showLibrary ? (
        <div className="admin-upload-library">
          <div className="admin-upload-toolbar">
            <label className="admin-inline-search admin-inline-search-compact" htmlFor={`${inputId}-search`}>
              <Search size={16} aria-hidden="true" />
              <input
                id={`${inputId}-search`}
                type="search"
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                placeholder="Search existing media"
              />
            </label>
            <span className="admin-upload-meta">
              {filteredMedia.length} of {existingMedia.length} assets
            </span>
          </div>

          {loadingMedia ? (
            <div className="admin-upload-placeholder admin-upload-placeholder-library">
              <div>
                <p>Loading images...</p>
              </div>
            </div>
          ) : mediaError ? (
            <div className="admin-field-error">{mediaError}</div>
          ) : filteredMedia.length === 0 ? (
            <div className="admin-upload-placeholder admin-upload-placeholder-library">
              <div>
                <p>No images match this search yet.</p>
              </div>
            </div>
          ) : (
            <div className="admin-media-picker-grid">
              {filteredMedia.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="admin-media-picker-card"
                  onClick={() => {
                    onSelectExisting(item);
                    setLibraryQuery('');
                    setShowLibrary(false);
                  }}
                >
                  <img
                    src={item.publicUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="admin-media-picker-label">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {error ? <div className="admin-field-error">{error}</div> : null}
    </div>
  );
}
