import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Edit3,
  Plus,
  Save,
  SquareKanban,
  Trash2,
} from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ImageUploadField from '../../components/admin/ImageUploadField';
import StatusBadge from '../../components/admin/StatusBadge';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import { useAdminCollection } from '../../hooks/useAdminCollection';
import { useAdminMediaLibrary } from '../../hooks/useAdminMediaLibrary';
import { projectsAdminService } from '../../services/adminContentService';
import { showAdminToast } from '../../lib/adminToast';
import { deleteContentImage, uploadContentImage, validateImageFile } from '../../services/storageService';
import {
  formatListInput,
  normalizeNullableString,
  normalizeOptionalUrl,
  parseListInput,
  slugify,
  validateOptionalUrl,
} from '../../utils/content';

const EMPTY_PROJECT_FORM = {
  title: '',
  slug: '',
  short_description: '',
  full_description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  category: '',
  status: '',
  featured: false,
  is_visible: true,
  image_url: '',
  image_path: '',
};
const PROJECT_STATUS_OPTIONS = ['', 'In Progress', 'Completed'];

function mapProjectToForm(project) {
  return {
    title: project.title || '',
    slug: project.slug || '',
    short_description: project.short_description || '',
    full_description: project.full_description || '',
    tech_stack: formatListInput(project.tech_stack),
    github_url: project.github_url || '',
    live_url: project.live_url || '',
    category: project.category || '',
    status: project.status || '',
    featured: Boolean(project.featured),
    is_visible: Boolean(project.is_visible),
    image_url: project.image_url || '',
    image_path: project.image_path || '',
  };
}

function validateProject(form, imageError) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Project title is required.';
  }

  if (!form.slug.trim()) {
    errors.slug = 'Project slug is required.';
  }

  if (!form.short_description.trim()) {
    errors.short_description = 'A short description is required.';
  }

  [
    ['github_url', 'GitHub URL'],
    ['live_url', 'Live URL'],
  ].forEach(([key, label]) => {
    const message = validateOptionalUrl(form[key], label);
    if (message) {
      errors[key] = message;
    }
  });

  if (imageError) {
    errors.image = imageError;
  }

  return errors;
}

export default function AdminProjectsPage() {
  const {
    items: projects,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  } = useAdminCollection(projectsAdminService);
  const {
    items: mediaItems,
    loading: mediaLoading,
    error: mediaError,
    loadMedia,
  } = useAdminMediaLibrary();
  const [form, setForm] = useState(EMPTY_PROJECT_FORM);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const editingProject = useMemo(
    () => projects.find((project) => project.id === editingProjectId) || null,
    [editingProjectId, projects],
  );

  const resetForm = () => {
    setForm(EMPTY_PROJECT_FORM);
    setEditingProjectId(null);
    setIsEditorOpen(false);
    setFormErrors({});
    setImageFile(null);
    setImageError('');
    setSlugTouched(false);
  };

  const startCreateProject = () => {
    setForm(EMPTY_PROJECT_FORM);
    setEditingProjectId(null);
    setIsEditorOpen(true);
    setFormErrors({});
    setImageFile(null);
    setImageError('');
    setSlugTouched(false);
    setStatusMessage('');
  };

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleTitleChange = (value) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
    setFormErrors((current) => ({ ...current, title: undefined, slug: undefined }));
    setStatusMessage('');
  };

  const handleEdit = (project) => {
    setEditingProjectId(project.id);
    setIsEditorOpen(true);
    setForm(mapProjectToForm(project));
    setImageFile(null);
    setImageError('');
    setFormErrors({});
    setStatusMessage('');
    setSlugTouched(true);
  };

  const handleFileChange = (file) => {
    const validationMessage = validateImageFile(file);
    setImageError(validationMessage);
    setImageFile(validationMessage ? null : file);
    setFormErrors((current) => ({ ...current, image: undefined }));
  };

  const clearSelectedImage = () => {
    setImageFile(null);
    setImageError('');
    setField('image_url', '');
    setField('image_path', '');
  };

  const handleSelectExistingImage = (item) => {
    setImageFile(null);
    setImageError('');
    setField('image_url', item.publicUrl);
    setField('image_path', item.path);
  };

  const statusOptions = useMemo(() => (
    PROJECT_STATUS_OPTIONS.includes(form.status)
      ? PROJECT_STATUS_OPTIONS
      : [...PROJECT_STATUS_OPTIONS, form.status]
  ), [form.status]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateProject(form, imageError);
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);
    setStatusMessage('');

    try {
      let imageUrl = form.image_url || null;
      let imagePath = form.image_path || null;

      if (imageFile) {
        const upload = await uploadContentImage({
          file: imageFile,
          entityType: 'projects',
          name: form.title,
          existingPath: editingProject?.image_path || null,
        });

        imageUrl = upload.imageUrl;
        imagePath = upload.imagePath;
      } else if (editingProject?.image_path && !form.image_url && !form.image_path) {
        await deleteContentImage(editingProject.image_path).catch(() => null);
        imageUrl = null;
        imagePath = null;
      }

      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug) || slugify(form.title),
        short_description: form.short_description.trim(),
        full_description: normalizeNullableString(form.full_description),
        image_url: imageUrl,
        image_path: imagePath,
        tech_stack: parseListInput(form.tech_stack),
        github_url: normalizeOptionalUrl(form.github_url),
        live_url: normalizeOptionalUrl(form.live_url),
        category: normalizeNullableString(form.category),
        status: normalizeNullableString(form.status),
        featured: Boolean(form.featured),
        is_visible: Boolean(form.is_visible),
        display_order: editingProject?.display_order ?? projects.length,
      };

      if (editingProject) {
        await updateItem(editingProject.id, payload);
        setStatusMessage('Project updated successfully.');
      } else {
        await createItem(payload);
        setStatusMessage('Project created successfully.');
        showAdminToast({
          title: 'New project created',
          message: `${payload.title} was added successfully.`,
        });
      }

      setStatusTone('info');
      resetForm();
      await loadItems();
      await loadMedia();
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save this project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await removeItem(pendingDelete.id);
      if (pendingDelete.image_path) {
        await deleteContentImage(pendingDelete.image_path).catch(() => null);
      }

      if (pendingDelete.id === editingProjectId) {
        resetForm();
      }

      setStatusTone('info');
      setStatusMessage('Project deleted successfully.');
      await loadMedia();
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this project.');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleToggleVisibility = async (project, isVisible) => {
    try {
      await updateItem(project.id, { is_visible: isVisible });
      setStatusTone('info');
      setStatusMessage(`${project.title} is now ${isVisible ? 'visible' : 'hidden'} on the website.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update visibility.');
    }
  };

  const handleMove = async (index, direction) => {
    try {
      await reorderItems(index, direction);
      setStatusTone('info');
      setStatusMessage('Project order updated.');
      await loadItems();
    } catch (moveError) {
      setStatusTone('error');
      setStatusMessage(moveError.message || 'Unable to reorder projects.');
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Projects"
        description="Manage project cards, status, links, visibility, and featured placement."
        actions={(
          <>
            <a
              href="/#projects"
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-secondary"
            >
              <ArrowUpRight size={16} />
              <span>Preview projects</span>
            </a>
            <button
              type="button"
              className="admin-button admin-button-primary admin-button-icon"
              onClick={startCreateProject}
              aria-label="Create project"
              title="Create project"
            >
              <Plus size={18} />
            </button>
          </>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      <section className={`admin-grid${isEditorOpen ? '' : ' admin-grid-single'}`}>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>Current projects</h2>
                <p>Manage the cards shown in the public projects section.</p>
              </div>
            </div>

            {loading ? (
              <div className="admin-loading">
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Loading projects...</p>
                </div>
              </div>
            ) : error ? (
              <AdminNotice tone="error">{error}</AdminNotice>
            ) : projects.length === 0 ? (
              <AdminNotice tone="empty">No projects yet. Use the + button to add the first card.</AdminNotice>
            ) : (
              <div className="admin-record-list">
                {projects.map((project, index) => (
                  <article key={project.id} className="admin-record-card">
                    <div className="admin-record-top">
                      <div className="admin-record-meta">
                        <div className="admin-record-thumb">
                          {project.image_url ? (
                            <img src={project.image_url} alt={project.title} />
                          ) : (
                            <div className="admin-upload-placeholder" style={{ minHeight: '100%', padding: '0.6rem' }}>
                              <SquareKanban size={18} />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="admin-record-title">{project.title}</div>
                          <p className="admin-record-subtitle">
                            {project.slug}
                            {project.category ? ` - ${project.category}` : ''}
                            {project.status ? ` - ${project.status}` : ''}
                          </p>
                          <p className="admin-record-copy" style={{ marginTop: '0.5rem' }}>
                            {project.short_description}
                          </p>
                        </div>
                      </div>

                      <div className="admin-pill-row">
                        <StatusBadge label={project.is_visible ? 'Visible' : 'Hidden'} tone={project.is_visible ? 'visible' : 'hidden'} />
                        {project.featured ? <StatusBadge label="Featured" tone="featured" /> : null}
                        <span className="admin-pill">Order {index + 1}</span>
                      </div>
                    </div>

                    {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 ? (
                      <div className="admin-pill-row">
                        {project.tech_stack.map((item) => (
                          <span key={item} className="admin-pill">{item}</span>
                        ))}
                      </div>
                    ) : null}

                    <ToggleSwitch
                      checked={project.is_visible}
                      onChange={(nextValue) => handleToggleVisibility(project, nextValue)}
                      label={project.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                      hint="Hide without deleting."
                    />

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-up"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${project.title} up`}
                        title={`Move ${project.title} up`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-down"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === projects.length - 1}
                        aria-label={`Move ${project.title} down`}
                        title={`Move ${project.title} down`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-edit"
                        onClick={() => handleEdit(project)}
                        aria-label={`Edit ${project.title}`}
                        title={`Edit ${project.title}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-danger admin-button-icon"
                        onClick={() => setPendingDelete(project)}
                        aria-label={`Delete ${project.title}`}
                        title={`Delete ${project.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditorOpen ? (
        <div className="admin-card">
            <div className="admin-card-body">
              <div className="admin-card-header">
                <div>
                  <h2>Project editor</h2>
                  <p>{editingProject ? 'Update this project.' : 'Create a new project card.'}</p>
                </div>
              </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <AdminField label="Title" htmlFor="project_title" error={formErrors.title}>
                  <input
                    id="project_title"
                    className="admin-input"
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                  />
                </AdminField>

                <AdminField label="Slug" htmlFor="project_slug" error={formErrors.slug}>
                  <input
                    id="project_slug"
                    className="admin-input"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setField('slug', event.target.value);
                    }}
                  />
                </AdminField>

                <AdminField label="Category" htmlFor="project_category">
                  <input
                    id="project_category"
                    className="admin-input"
                    value={form.category}
                    onChange={(event) => setField('category', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Status" htmlFor="project_status">
                  <select
                    id="project_status"
                    className="admin-select"
                    value={form.status}
                    onChange={(event) => setField('status', event.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option || 'unset'} value={option}>
                        {option || 'Select status'}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>

              <AdminField label="Short description" htmlFor="project_short_description" error={formErrors.short_description}>
                <textarea
                  id="project_short_description"
                  className="admin-textarea"
                  value={form.short_description}
                  onChange={(event) => setField('short_description', event.target.value)}
                />
              </AdminField>

              <AdminField label="Full description" htmlFor="project_full_description">
                <textarea
                  id="project_full_description"
                  className="admin-textarea"
                  value={form.full_description}
                  onChange={(event) => setField('full_description', event.target.value)}
                />
              </AdminField>

              <AdminField
                label="Tech stack"
                htmlFor="project_tech_stack"
                description="Separate items with commas or new lines."
              >
                <textarea
                  id="project_tech_stack"
                  className="admin-textarea"
                  value={form.tech_stack}
                  onChange={(event) => setField('tech_stack', event.target.value)}
                />
              </AdminField>

              <div className="admin-form-grid">
                <AdminField label="GitHub URL" htmlFor="project_github" error={formErrors.github_url}>
                  <input
                    id="project_github"
                    className="admin-input"
                    value={form.github_url}
                    onChange={(event) => setField('github_url', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Live URL" htmlFor="project_live" error={formErrors.live_url}>
                  <input
                    id="project_live"
                    className="admin-input"
                    value={form.live_url}
                    onChange={(event) => setField('live_url', event.target.value)}
                  />
                </AdminField>
              </div>

              <ImageUploadField
                label="Project image"
                currentUrl={form.image_url}
                file={imageFile}
                error={formErrors.image}
                helpText="Use an image that crops well in a card layout."
                existingMedia={mediaItems}
                loadingMedia={mediaLoading}
                mediaError={mediaError}
                onFileChange={handleFileChange}
                onClearSelection={clearSelectedImage}
                onSelectExisting={handleSelectExistingImage}
              />

              <ToggleSwitch
                checked={form.featured}
                onChange={(nextValue) => setField('featured', nextValue)}
                label={form.featured ? 'Featured project' : 'Not featured'}
                hint="Highlights this project on the site."
              />

              <ToggleSwitch
                checked={form.is_visible}
                onChange={(nextValue) => setField('is_visible', nextValue)}
                label={form.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                hint="Hide without deleting."
              />

              <div className="admin-form-actions">
                <button type="button" className="admin-button admin-button-ghost" onClick={resetForm}>
                  {editingProject ? 'Cancel edit' : 'Cancel'}
                </button>
                <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingProject ? 'Save project' : 'Create project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete project?"
        description={`This will permanently remove ${pendingDelete?.title || 'this project'} from the admin portal and the public website.`}
        confirmLabel="Delete project"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}


