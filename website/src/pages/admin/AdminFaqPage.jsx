import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Edit3,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import AdminField from '../../components/admin/AdminField';
import AdminNotice from '../../components/admin/AdminNotice';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import { useAdminEditorAutoReveal } from '../../hooks/useAdminEditorAutoReveal';
import {
  getDefaultFaqSection,
  loadManagedFaqSection,
  saveManagedFaqSection,
} from '../../services/faqContentService';
import { showAdminToast } from '../../lib/adminToast';
import { moveItem } from '../../utils/content';

const EMPTY_ITEM_FORM = {
  title: '',
  description: '',
  is_visible: true,
};

function createLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `faq-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeQuestionItems(items = []) {
  return [...(Array.isArray(items) ? items : [])]
    .map((item, index) => ({
      id: item?.id || `faq-item-${index + 1}`,
      title: item?.title || '',
      description: item?.description || '',
      displayOrder: Number.isFinite(item?.displayOrder) ? item.displayOrder : index,
      isVisible: item?.isVisible ?? true,
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

function mapSectionToForm(section) {
  return {
    kicker: section.kicker || 'FAQ',
    title: section.title || '',
    description: section.description || '',
  };
}

function mapItemToForm(item) {
  return {
    title: item.title || '',
    description: item.description || '',
    is_visible: Boolean(item.isVisible),
  };
}

function validateSection(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'FAQ title is required.';
  }

  return errors;
}

function validateItem(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Question is required.';
  }

  if (!form.description.trim()) {
    errors.description = 'Answer is required.';
  }

  return errors;
}

export default function AdminFaqPage() {
  const [faqSection, setFaqSection] = useState(() => getDefaultFaqSection());
  const [sectionForm, setSectionForm] = useState(() => mapSectionToForm(getDefaultFaqSection()));
  const [sectionErrors, setSectionErrors] = useState({});
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [itemErrors, setItemErrors] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const sectionEditorRef = useAdminEditorAutoReveal(isSectionEditorOpen);
  const questionEditorRef = useAdminEditorAutoReveal(isQuestionEditorOpen);

  const questionItems = useMemo(
    () => normalizeQuestionItems(faqSection.items),
    [faqSection.items],
  );

  const editingItem = useMemo(
    () => questionItems.find((item) => item.id === editingItemId) || null,
    [editingItemId, questionItems],
  );

  useEffect(() => {
    let isActive = true;

    async function loadFaqContent() {
      setLoading(true);

      try {
        const nextSection = await loadManagedFaqSection();

        if (!isActive) {
          return;
        }

        setFaqSection(nextSection);
        setSectionForm(mapSectionToForm(nextSection));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadFaqContent();

    return () => {
      isActive = false;
    };
  }, []);

  function setSectionField(key, value) {
    setSectionForm((current) => ({ ...current, [key]: value }));
    setSectionErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  }

  function setItemField(key, value) {
    setItemForm((current) => ({ ...current, [key]: value }));
    setItemErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  }

  function resetItemForm() {
    setEditingItemId(null);
    setIsQuestionEditorOpen(false);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
  }

  function openSectionEditor() {
    setIsSectionEditorOpen(true);
    setSectionErrors({});
    setStatusMessage('');
  }

  function closeSectionEditor() {
    setIsSectionEditorOpen(false);
    setSectionForm(mapSectionToForm(faqSection));
    setSectionErrors({});
  }

  function startCreateQuestion() {
    setEditingItemId(null);
    setIsQuestionEditorOpen(true);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
    setStatusMessage('');
  }

  function openQuestionEditor(item) {
    setEditingItemId(item.id);
    setIsQuestionEditorOpen(true);
    setItemForm(mapItemToForm(item));
    setItemErrors({});
    setStatusMessage('');
  }

  async function persistFaqSection(nextSection, successMessage) {
    const savedSection = await saveManagedFaqSection(nextSection);
    setFaqSection(savedSection);
    setSectionForm(mapSectionToForm(savedSection));
    setStatusTone('info');
    setStatusMessage(successMessage);
    return savedSection;
  }

  async function handleSectionSubmit(event) {
    event.preventDefault();

    const nextErrors = validateSection(sectionForm);
    if (Object.keys(nextErrors).length) {
      setSectionErrors(nextErrors);
      return;
    }

    setSectionSaving(true);
    setStatusMessage('');

    try {
      await persistFaqSection(
        {
          ...faqSection,
          kicker: sectionForm.kicker.trim() || 'FAQ',
          title: sectionForm.title.trim(),
          description: sectionForm.description.trim(),
          items: questionItems,
        },
        'FAQ section updated successfully.',
      );
      setIsSectionEditorOpen(false);
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to save the FAQ section.');
    } finally {
      setSectionSaving(false);
    }
  }

  async function handleItemSubmit(event) {
    event.preventDefault();

    const nextErrors = validateItem(itemForm);
    if (Object.keys(nextErrors).length) {
      setItemErrors(nextErrors);
      return;
    }

    setItemSaving(true);
    setStatusMessage('');

    try {
      const nextItem = {
        id: editingItem?.id || createLocalId(),
        title: itemForm.title.trim(),
        description: itemForm.description.trim(),
        isVisible: Boolean(itemForm.is_visible),
      };

      const nextItems = editingItem
        ? questionItems.map((item) => (item.id === editingItem.id ? { ...item, ...nextItem } : item))
        : [...questionItems, { ...nextItem, displayOrder: questionItems.length }];

      await persistFaqSection(
        {
          ...faqSection,
          items: nextItems.map((item, index) => ({
            ...item,
            displayOrder: index,
          })),
        },
        editingItem ? 'Question updated successfully.' : 'Question created successfully.',
      );

      if (!editingItem) {
        showAdminToast({
          title: 'New question created',
          message: `${nextItem.title} was added successfully.`,
        });
      }

      resetItemForm();
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to save this question.');
    } finally {
      setItemSaving(false);
    }
  }

  async function handleItemVisibility(item, isVisible) {
    try {
      await persistFaqSection(
        {
          ...faqSection,
          items: questionItems.map((entry, index) => ({
            ...entry,
            isVisible: entry.id === item.id ? isVisible : entry.isVisible,
            displayOrder: index,
          })),
        },
        `${item.title} is now ${isVisible ? 'visible' : 'hidden'} on the website.`,
      );
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to update question visibility.');
    }
  }

  async function handleItemMove(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questionItems.length) {
      return;
    }

    try {
      const reorderedItems = moveItem(questionItems, index, targetIndex).map((item, orderIndex) => ({
        ...item,
        displayOrder: orderIndex,
      }));

      await persistFaqSection(
        {
          ...faqSection,
          items: reorderedItems,
        },
        'Question order updated.',
      );
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to reorder questions.');
    }
  }

  async function handleDeleteItem() {
    if (!pendingDeleteItem) {
      return;
    }

    try {
      const nextItems = questionItems
        .filter((item) => item.id !== pendingDeleteItem.id)
        .map((item, index) => ({
          ...item,
          displayOrder: index,
        }));

      await persistFaqSection(
        {
          ...faqSection,
          items: nextItems,
        },
        'Question deleted successfully.',
      );

      if (editingItemId === pendingDeleteItem.id) {
        resetItemForm();
      }
    } catch (error) {
      setStatusTone('error');
      setStatusMessage(error.message || 'Unable to delete this question.');
    } finally {
      setPendingDeleteItem(null);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Questions Before You Apply"
        description="Manage the website FAQ block and update the questions visitors see before they apply."
        actions={(
          <a
            href="/#faq"
            target="_blank"
            rel="noreferrer"
            className="admin-button admin-button-secondary"
          >
            <ArrowUpRight size={16} />
            <span>Preview FAQ</span>
          </a>
        )}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}

      {loading ? (
        <div className="admin-loading">
          <div>
            <div className="admin-loading-spinner" />
            <p>Loading FAQ content...</p>
          </div>
        </div>
      ) : (
        <>
          <section className={`admin-grid${isSectionEditorOpen ? '' : ' admin-grid-single'}`}>
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Website FAQ section</h2>
                    <p>This is the Questions Before You Apply block shown on the website.</p>
                  </div>
                </div>

                <article className="admin-record-card is-selected">
                  <div className="admin-record-top">
                    <div>
                      <div className="admin-record-title">{faqSection.title}</div>
                      <p className="admin-record-subtitle">#{faqSection.anchorId}</p>
                      {faqSection.description ? (
                        <p className="admin-record-copy admin-record-copy-offset">
                          {faqSection.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="admin-pill-row">
                      <span className="admin-pill">{questionItems.length} questions</span>
                    </div>
                  </div>

                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-button admin-button-secondary admin-button-icon"
                      onClick={openSectionEditor}
                      aria-label="Edit FAQ section"
                      title="Edit FAQ section"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </article>
              </div>
            </div>

            {isSectionEditorOpen ? (
              <div ref={sectionEditorRef} className="admin-card admin-editor-card">
                <div className="admin-card-body">
                  <div className="admin-card-header">
                    <div>
                      <h2>FAQ section editor</h2>
                      <p>Update the heading and intro copy for the FAQ block here.</p>
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleSectionSubmit}>
                    <AdminField label="Kicker" htmlFor="faq_kicker">
                      <input
                        id="faq_kicker"
                        className="admin-input"
                        value={sectionForm.kicker}
                        onChange={(event) => setSectionField('kicker', event.target.value)}
                        placeholder="FAQ"
                      />
                    </AdminField>

                    <AdminField label="FAQ title" htmlFor="faq_title" error={sectionErrors.title}>
                      <input
                        id="faq_title"
                        className="admin-input"
                        value={sectionForm.title}
                        onChange={(event) => setSectionField('title', event.target.value)}
                        placeholder="Questions Before You Apply"
                      />
                    </AdminField>

                    <AdminField
                      label="FAQ description"
                      htmlFor="faq_description"
                      description="This copy appears above the list of questions on the website."
                    >
                      <textarea
                        id="faq_description"
                        className="admin-textarea"
                        value={sectionForm.description}
                        onChange={(event) => setSectionField('description', event.target.value)}
                        placeholder="A short intro for the FAQ section."
                      />
                    </AdminField>

                    <div className="admin-form-actions">
                      <button type="button" className="admin-button admin-button-ghost" onClick={closeSectionEditor}>
                        Cancel edit
                      </button>
                      <button type="submit" className="admin-button admin-button-primary" disabled={sectionSaving}>
                        <Save size={16} />
                        <span>{sectionSaving ? 'Saving...' : 'Save FAQ section'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </section>

          <section className={`admin-grid${isQuestionEditorOpen ? '' : ' admin-grid-single'}`}>
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-card-header">
                  <div>
                    <h2>Questions</h2>
                    <p>Add, remove, reorder, or edit the questions shown in Questions Before You Apply.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-button admin-button-primary admin-button-icon"
                    onClick={startCreateQuestion}
                    aria-label="Create question"
                    title="Create question"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {questionItems.length === 0 ? (
                  <AdminNotice tone="empty">
                    No questions yet. Use the + button to add the first question.
                  </AdminNotice>
                ) : (
                  <div className="admin-record-list">
                    {questionItems.map((item, index) => (
                      <article key={item.id} className="admin-record-card">
                        <div className="admin-record-top">
                          <div>
                            <div className="admin-record-title">{item.title}</div>
                            <p className="admin-record-copy admin-record-copy-offset">
                              {item.description}
                            </p>
                          </div>

                          <div className="admin-pill-row">
                            <StatusBadge label={item.isVisible ? 'Visible' : 'Hidden'} tone={item.isVisible ? 'visible' : 'hidden'} />
                            <span className="admin-pill">Order {index + 1}</span>
                          </div>
                        </div>

                        <ToggleSwitch
                          checked={item.isVisible}
                          onChange={(nextValue) => handleItemVisibility(item, nextValue)}
                          label={item.isVisible ? 'Visible on the website' : 'Hidden from the website'}
                          hint="Hide a question without removing it."
                        />

                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-button admin-button-icon admin-button-move-up"
                            onClick={() => handleItemMove(index, 'up')}
                            disabled={index === 0}
                            aria-label={`Move ${item.title} up`}
                            title={`Move ${item.title} up`}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-icon admin-button-move-down"
                            onClick={() => handleItemMove(index, 'down')}
                            disabled={index === questionItems.length - 1}
                            aria-label={`Move ${item.title} down`}
                            title={`Move ${item.title} down`}
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-icon admin-button-edit"
                            onClick={() => openQuestionEditor(item)}
                            aria-label={`Edit ${item.title}`}
                            title={`Edit ${item.title}`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-danger admin-button-icon"
                            onClick={() => setPendingDeleteItem(item)}
                            aria-label={`Delete ${item.title}`}
                            title={`Delete ${item.title}`}
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

            {isQuestionEditorOpen ? (
              <div ref={questionEditorRef} className="admin-card admin-editor-card">
                <div className="admin-card-body">
                  <div className="admin-card-header">
                    <div>
                      <h2>Question editor</h2>
                      <p>Use this form to manage the questions and answers shown in Questions Before You Apply.</p>
                    </div>
                  </div>

                  <form className="admin-form" onSubmit={handleItemSubmit}>
                    <AdminField label="Question" htmlFor="faq_item_title" error={itemErrors.title}>
                      <input
                        id="faq_item_title"
                        className="admin-input"
                        value={itemForm.title}
                        onChange={(event) => setItemField('title', event.target.value)}
                        placeholder="What do applicants usually ask?"
                      />
                    </AdminField>

                    <AdminField label="Answer" htmlFor="faq_item_description" error={itemErrors.description}>
                      <textarea
                        id="faq_item_description"
                        className="admin-textarea"
                        value={itemForm.description}
                        onChange={(event) => setItemField('description', event.target.value)}
                        placeholder="Write the answer shown in the FAQ accordion."
                      />
                    </AdminField>

                    <ToggleSwitch
                      checked={itemForm.is_visible}
                      onChange={(nextValue) => setItemField('is_visible', nextValue)}
                      label={itemForm.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                      hint="Hide a question while keeping it saved."
                    />

                    <div className="admin-form-actions">
                      <button type="button" className="admin-button admin-button-ghost" onClick={resetItemForm}>
                        {editingItem ? 'Cancel edit' : 'Cancel'}
                      </button>
                      <button type="submit" className="admin-button admin-button-primary" disabled={itemSaving}>
                        <Save size={16} />
                        <span>{itemSaving ? 'Saving...' : editingItem ? 'Save question' : 'Create question'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </section>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteItem)}
        title="Delete question?"
        description={`This will permanently remove ${pendingDeleteItem?.title || 'this question'} from the FAQ section.`}
        confirmLabel="Delete question"
        onConfirm={handleDeleteItem}
        onCancel={() => setPendingDeleteItem(null)}
      />
    </div>
  );
}
