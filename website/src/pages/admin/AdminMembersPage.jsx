import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Edit3,
  Plus,
  Save,
  Trash2,
  Users,
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
import { membersAdminService } from '../../services/adminContentService';
import { showAdminToast } from '../../lib/adminToast';
import { deleteContentImage, uploadContentImage, validateImageFile } from '../../services/storageService';
import {
  formatListInput,
  normalizeOptionalEmail,
  normalizeOptionalUrl,
  parseListInput,
  validateOptionalUrl,
} from '../../utils/content';

const EMPTY_MEMBER_FORM = {
  name: '',
  role: '',
  department: '',
  short_bio: '',
  email: '',
  github_url: '',
  linkedin_url: '',
  instagram_url: '',
  twitter_url: '',
  skills: '',
  image_url: '',
  image_path: '',
  is_visible: true,
};

function mapMemberToForm(member) {
  return {
    name: member.name || '',
    role: member.role || '',
    department: member.department || '',
    short_bio: member.short_bio || '',
    email: member.email || '',
    github_url: member.github_url || '',
    linkedin_url: member.linkedin_url || '',
    instagram_url: member.instagram_url || '',
    twitter_url: member.twitter_url || '',
    skills: formatListInput(member.skills),
    image_url: member.image_url || '',
    image_path: member.image_path || '',
    is_visible: Boolean(member.is_visible),
  };
}

function validateMember(form, imageError) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.role.trim()) {
    errors.role = 'Role is required.';
  }

  if (!form.department.trim()) {
    errors.department = 'Department is required.';
  }

  if (!form.short_bio.trim()) {
    errors.short_bio = 'A short bio is required.';
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  [
    ['github_url', 'GitHub URL'],
    ['linkedin_url', 'LinkedIn URL'],
    ['instagram_url', 'Instagram URL'],
    ['twitter_url', 'Twitter/X URL'],
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

export default function AdminMembersPage() {
  const {
    items: members,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  } = useAdminCollection(membersAdminService);
  const {
    items: mediaItems,
    loading: mediaLoading,
    error: mediaError,
    loadMedia,
  } = useAdminMediaLibrary();
  const [form, setForm] = useState(EMPTY_MEMBER_FORM);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [pendingDelete, setPendingDelete] = useState(null);

  const editingMember = useMemo(
    () => members.find((member) => member.id === editingMemberId) || null,
    [editingMemberId, members],
  );

  const resetForm = () => {
    setForm(EMPTY_MEMBER_FORM);
    setEditingMemberId(null);
    setIsEditorOpen(false);
    setFormErrors({});
    setImageFile(null);
    setImageError('');
  };

  const startCreateMember = () => {
    setForm(EMPTY_MEMBER_FORM);
    setEditingMemberId(null);
    setIsEditorOpen(true);
    setFormErrors({});
    setImageFile(null);
    setImageError('');
    setStatusMessage('');
  };

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleEdit = (member) => {
    setEditingMemberId(member.id);
    setIsEditorOpen(true);
    setForm(mapMemberToForm(member));
    setFormErrors({});
    setImageFile(null);
    setImageError('');
    setStatusMessage('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateMember(form, imageError);
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
          entityType: 'members',
          name: form.name,
          existingPath: editingMember?.image_path || null,
        });

        imageUrl = upload.imageUrl;
        imagePath = upload.imagePath;
      } else if (editingMember?.image_path && !form.image_url && !form.image_path) {
        await deleteContentImage(editingMember.image_path).catch(() => null);
        imageUrl = null;
        imagePath = null;
      }

      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department.trim(),
        short_bio: form.short_bio.trim(),
        image_url: imageUrl,
        image_path: imagePath,
        email: normalizeOptionalEmail(form.email),
        github_url: normalizeOptionalUrl(form.github_url),
        linkedin_url: normalizeOptionalUrl(form.linkedin_url),
        instagram_url: normalizeOptionalUrl(form.instagram_url),
        twitter_url: normalizeOptionalUrl(form.twitter_url),
        skills: parseListInput(form.skills),
        is_visible: Boolean(form.is_visible),
        display_order: editingMember?.display_order ?? members.length,
      };

      if (editingMember) {
        await updateItem(editingMember.id, payload);
        setStatusMessage('Member updated successfully.');
      } else {
        await createItem(payload);
        setStatusMessage('Member created successfully.');
        showAdminToast({
          title: 'New member created',
          message: `${payload.name} was added successfully.`,
        });
      }

      setStatusTone('info');
      resetForm();
      await loadItems();
      await loadMedia();
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save this member.');
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

      if (pendingDelete.id === editingMemberId) {
        resetForm();
      }

      setStatusTone('info');
      setStatusMessage('Member deleted successfully.');
      await loadMedia();
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this member.');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleToggleVisibility = async (member, isVisible) => {
    try {
      await updateItem(member.id, { is_visible: isVisible });
      setStatusTone('info');
      setStatusMessage(`${member.name} is now ${isVisible ? 'visible' : 'hidden'} on the website.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update visibility.');
    }
  };

  const handleMove = async (index, direction) => {
    try {
      await reorderItems(index, direction);
      setStatusTone('info');
      setStatusMessage('Member order updated.');
      await loadItems();
    } catch (moveError) {
      setStatusTone('error');
      setStatusMessage(moveError.message || 'Unable to reorder members.');
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Team"
        description="Manage team profiles, images, visibility, order, and social links."
        actions={(
          <>
            <a
              href="/#team"
              target="_blank"
              rel="noreferrer"
              className="admin-button admin-button-secondary"
            >
              <ArrowUpRight size={16} />
              <span>Preview team</span>
            </a>
            <button
              type="button"
              className="admin-button admin-button-primary admin-button-icon"
              onClick={startCreateMember}
              aria-label="Create member"
              title="Create member"
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
                <h2>Current members</h2>
                <p>Reorder cards to match the public site.</p>
              </div>
            </div>

            {loading ? (
              <div className="admin-loading">
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Loading members...</p>
                </div>
              </div>
            ) : error ? (
              <AdminNotice tone="error">{error}</AdminNotice>
            ) : members.length === 0 ? (
              <AdminNotice tone="empty">No team members yet. Use the + button to add the first profile.</AdminNotice>
            ) : (
              <div className="admin-record-list">
                {members.map((member, index) => (
                  <article key={member.id} className="admin-record-card">
                    <div className="admin-record-top">
                      <div className="admin-record-meta">
                        <div className="admin-record-thumb">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} />
                          ) : (
                            <div className="admin-upload-placeholder" style={{ minHeight: '100%', padding: '0.6rem' }}>
                              <Users size={18} />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="admin-record-title">{member.name}</div>
                          <p className="admin-record-subtitle">
                            {member.role} {member.department ? `- ${member.department}` : ''}
                          </p>
                          {member.short_bio ? (
                            <p className="admin-record-copy" style={{ marginTop: '0.5rem' }}>
                              {member.short_bio}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="admin-pill-row">
                        <StatusBadge label={member.is_visible ? 'Visible' : 'Hidden'} tone={member.is_visible ? 'visible' : 'hidden'} />
                        <span className="admin-pill">Order {index + 1}</span>
                      </div>
                    </div>

                    {Array.isArray(member.skills) && member.skills.length > 0 ? (
                      <div className="admin-pill-row">
                        {member.skills.map((skill) => (
                          <span key={skill} className="admin-pill">{skill}</span>
                        ))}
                      </div>
                    ) : null}

                    <ToggleSwitch
                      checked={member.is_visible}
                      onChange={(nextValue) => handleToggleVisibility(member, nextValue)}
                      label={member.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                      hint="Hide without deleting."
                    />

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-up"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${member.name} up`}
                        title={`Move ${member.name} up`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-move-down"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === members.length - 1}
                        aria-label={`Move ${member.name} down`}
                        title={`Move ${member.name} down`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-edit"
                        onClick={() => handleEdit(member)}
                        aria-label={`Edit ${member.name}`}
                        title={`Edit ${member.name}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-danger admin-button-icon"
                        onClick={() => setPendingDelete(member)}
                        aria-label={`Delete ${member.name}`}
                        title={`Delete ${member.name}`}
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
                  <h2>Member editor</h2>
                  <p>{editingMember ? 'Update this profile.' : 'Create a new team profile.'}</p>
                </div>
              </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <AdminField label="Name" htmlFor="member_name" error={formErrors.name}>
                  <input
                    id="member_name"
                    className="admin-input"
                    value={form.name}
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Role" htmlFor="member_role" error={formErrors.role}>
                  <input
                    id="member_role"
                    className="admin-input"
                    value={form.role}
                    onChange={(event) => setField('role', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Department" htmlFor="member_department" error={formErrors.department}>
                  <input
                    id="member_department"
                    className="admin-input"
                    value={form.department}
                    onChange={(event) => setField('department', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Email" htmlFor="member_email" error={formErrors.email}>
                  <input
                    id="member_email"
                    type="email"
                    className="admin-input"
                    value={form.email}
                    onChange={(event) => setField('email', event.target.value)}
                  />
                </AdminField>
              </div>

              <AdminField label="Short bio" htmlFor="member_short_bio" error={formErrors.short_bio}>
                <textarea
                  id="member_short_bio"
                  className="admin-textarea"
                  value={form.short_bio}
                  onChange={(event) => setField('short_bio', event.target.value)}
                />
              </AdminField>

              <AdminField
                label="Skills"
                htmlFor="member_skills"
                description="Separate items with commas or new lines."
              >
                <textarea
                  id="member_skills"
                  className="admin-textarea"
                  value={form.skills}
                  onChange={(event) => setField('skills', event.target.value)}
                />
              </AdminField>

              <div className="admin-form-grid">
                <AdminField label="GitHub URL" htmlFor="member_github" error={formErrors.github_url}>
                  <input
                    id="member_github"
                    className="admin-input"
                    value={form.github_url}
                    onChange={(event) => setField('github_url', event.target.value)}
                  />
                </AdminField>

                <AdminField label="LinkedIn URL" htmlFor="member_linkedin" error={formErrors.linkedin_url}>
                  <input
                    id="member_linkedin"
                    className="admin-input"
                    value={form.linkedin_url}
                    onChange={(event) => setField('linkedin_url', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Instagram URL" htmlFor="member_instagram" error={formErrors.instagram_url}>
                  <input
                    id="member_instagram"
                    className="admin-input"
                    value={form.instagram_url}
                    onChange={(event) => setField('instagram_url', event.target.value)}
                  />
                </AdminField>

                <AdminField label="Twitter/X URL" htmlFor="member_twitter" error={formErrors.twitter_url}>
                  <input
                    id="member_twitter"
                    className="admin-input"
                    value={form.twitter_url}
                    onChange={(event) => setField('twitter_url', event.target.value)}
                  />
                </AdminField>
              </div>

              <ImageUploadField
                label="Member image"
                currentUrl={form.image_url}
                file={imageFile}
                error={formErrors.image}
                helpText="Uploads are stored in the shared media library."
                existingMedia={mediaItems}
                loadingMedia={mediaLoading}
                mediaError={mediaError}
                onFileChange={handleFileChange}
                onClearSelection={clearSelectedImage}
                onSelectExisting={handleSelectExistingImage}
              />

              <ToggleSwitch
                checked={form.is_visible}
                onChange={(nextValue) => setField('is_visible', nextValue)}
                label={form.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                hint="Save as draft or archive without deleting."
              />

              <div className="admin-form-actions">
                <button type="button" className="admin-button admin-button-ghost" onClick={resetForm}>
                  {editingMember ? 'Cancel edit' : 'Cancel'}
                </button>
                <button type="submit" className="admin-button admin-button-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingMember ? 'Save member' : 'Create member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete member?"
        description={`This will permanently remove ${pendingDelete?.name || 'this member'} from the admin portal and the public website.`}
        confirmLabel="Delete member"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}


