import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
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
import { faqItems } from '../../data';
import { useAdminCollection } from '../../hooks/useAdminCollection';
import { siteSectionsAdminService } from '../../services/adminContentService';
import { moveItem, normalizeNullableString, slugify, toDisplayOrder } from '../../utils/content';

const SECTION_LAYOUT_OPTIONS = [
  {
    value: 'card_grid',
    label: 'Cards Grid',
    description: 'Best for sections like How We Build where each item is a visual card.',
  },
  {
    value: 'faq',
    label: 'FAQ',
    description: 'Best for accordion-style question and answer sections.',
  },
];

const EMPTY_SECTION_FORM = {
  label: '',
  section_key: '',
  anchor_id: '',
  layout_type: 'card_grid',
  kicker: '',
  title: '',
  description: '',
  is_visible: true,
};

const EMPTY_ITEM_FORM = {
  title: '',
  subtitle: '',
  description: '',
  is_visible: true,
};

const FAQ_SECTION_KEY = 'faq';
const DEFAULT_FAQ_SECTION_TITLE = 'Questions Before You Apply';
const DEFAULT_FAQ_SECTION_DESCRIPTION = 'A few quick answers about joining the team, the application flow, and what we look for.';

function createLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `section-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSectionItems(items = []) {
  return [...(Array.isArray(items) ? items : [])]
    .map((item, index) => ({
      id: item?.id || `section-item-${index}`,
      title: item?.title || '',
      subtitle: item?.subtitle || '',
      description: item?.description || '',
      displayOrder: toDisplayOrder(item?.display_order ?? item?.displayOrder, index),
      isVisible: item?.is_visible ?? item?.isVisible ?? true,
    }))
    .sort((left, right) => {
      const orderDifference = left.displayOrder - right.displayOrder;
      if (orderDifference !== 0) {
        return orderDifference;
      }

      return String(left.title || '').localeCompare(String(right.title || ''));
    });
}

function serializeSectionItems(items = []) {
  return normalizeSectionItems(items).map((item, index) => ({
    id: item.id || createLocalId(),
    title: item.title.trim(),
    subtitle: normalizeNullableString(item.subtitle),
    description: item.description.trim(),
    display_order: index,
    is_visible: Boolean(item.isVisible),
  }));
}

function mapSectionToForm(section) {
  return {
    label: section.label || '',
    section_key: section.section_key || '',
    anchor_id: section.anchor_id || '',
    layout_type: section.layout_type || 'card_grid',
    kicker: section.kicker || '',
    title: section.title || '',
    description: section.description || '',
    is_visible: Boolean(section.is_visible),
  };
}

function mapItemToForm(item) {
  return {
    title: item.title || '',
    subtitle: item.subtitle || '',
    description: item.description || '',
    is_visible: Boolean(item.isVisible),
  };
}

function getEmptySectionForm(faqOnly = false) {
  if (!faqOnly) {
    return EMPTY_SECTION_FORM;
  }

  return {
    ...EMPTY_SECTION_FORM,
    label: 'FAQ',
    section_key: FAQ_SECTION_KEY,
    anchor_id: FAQ_SECTION_KEY,
    layout_type: 'faq',
    kicker: 'FAQ',
    title: DEFAULT_FAQ_SECTION_TITLE,
    description: DEFAULT_FAQ_SECTION_DESCRIPTION,
  };
}

function getDefaultFaqSectionItems() {
  return faqItems.map((item, index) => ({
    id: `faq-default-${index + 1}`,
    title: item.question,
    subtitle: '',
    description: item.answer,
    displayOrder: index,
    isVisible: true,
  }));
}

function validateSection(form) {
  const errors = {};

  if (!form.label.trim()) {
    errors.label = 'Section label is required.';
  }

  if (!slugify(form.section_key || form.label)) {
    errors.section_key = 'Section key is required.';
  }

  if (!slugify(form.anchor_id || form.section_key || form.label)) {
    errors.anchor_id = 'Anchor id is required.';
  }

  if (!form.title.trim()) {
    errors.title = 'Section title is required.';
  }

  return errors;
}

function validateItem(form, layoutType) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = layoutType === 'faq' ? 'Question is required.' : 'Item title is required.';
  }

  if (!form.description.trim()) {
    errors.description = layoutType === 'faq' ? 'Answer is required.' : 'Description is required.';
  }

  return errors;
}

function getItemLabels(layoutType) {
  if (layoutType === 'faq') {
    return {
      title: 'Question',
      description: 'Answer',
      titlePlaceholder: 'What do applicants usually ask?',
      descriptionPlaceholder: 'Write the answer shown in the accordion.',
    };
  }

  return {
    title: 'Card title',
    subtitle: 'Tag',
    description: 'Description',
    titlePlaceholder: 'Idea to MVP',
    subtitlePlaceholder: 'Product Direction',
    descriptionPlaceholder: 'Describe what this section item stands for.',
  };
}

export default function AdminSectionsPage({ faqOnly = false }) {
  const {
    items: sections,
    loading,
    error,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  } = useAdminCollection(siteSectionsAdminService);
  const sectionsUnavailable = Boolean(error);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState(() => getEmptySectionForm(faqOnly));
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionKeyTouched, setSectionKeyTouched] = useState(false);
  const [anchorTouched, setAnchorTouched] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [itemErrors, setItemErrors] = useState({});
  const [itemSaving, setItemSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');
  const [pendingDeleteSection, setPendingDeleteSection] = useState(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const primaryFaqSection = useMemo(() => {
    if (!faqOnly) {
      return null;
    }

    return sections.find((section) => section.section_key === FAQ_SECTION_KEY)
      || sections.find((section) => section.layout_type === 'faq')
      || null;
  }, [faqOnly, sections]);
  const visibleSections = useMemo(
    () => (faqOnly ? (primaryFaqSection ? [primaryFaqSection] : []) : sections),
    [faqOnly, primaryFaqSection, sections],
  );

  const selectedSection = useMemo(
    () => visibleSections.find((section) => section.id === selectedSectionId) || null,
    [selectedSectionId, visibleSections],
  );

  const sectionItems = useMemo(
    () => normalizeSectionItems(selectedSection?.items),
    [selectedSection],
  );

  const editingItem = useMemo(
    () => sectionItems.find((item) => item.id === editingItemId) || null,
    [editingItemId, sectionItems],
  );

  const itemLabels = getItemLabels(sectionForm.layout_type);

  useEffect(() => {
    if (!visibleSections.length) {
      if (selectedSectionId !== null) {
        setSelectedSectionId(null);
        if (!isCreatingSection) {
          setSectionForm(getEmptySectionForm(faqOnly));
          setIsSectionEditorOpen(false);
        }
      }
      return;
    }

    if (isCreatingSection) {
      return;
    }

    if (selectedSectionId && visibleSections.some((section) => section.id === selectedSectionId)) {
      return;
    }

    const nextSection = faqOnly ? primaryFaqSection : visibleSections[0];
    if (!nextSection) {
      return;
    }

    setSelectedSectionId(nextSection.id);
    setSectionForm(mapSectionToForm(nextSection));
    setSectionErrors({});
    setSectionKeyTouched(true);
    setAnchorTouched(true);
    setIsSectionEditorOpen(false);
  }, [faqOnly, isCreatingSection, primaryFaqSection, selectedSectionId, visibleSections]);

  useEffect(() => {
    if (!editingItemId) {
      return;
    }

    if (!sectionItems.some((item) => item.id === editingItemId)) {
      setEditingItemId(null);
      setIsItemEditorOpen(false);
      setItemForm(EMPTY_ITEM_FORM);
      setItemErrors({});
    }
  }, [editingItemId, sectionItems]);

  const editSection = (section) => {
    setIsCreatingSection(false);
    setSelectedSectionId(section.id);
    setSectionForm(mapSectionToForm(section));
    setSectionErrors({});
    setSectionKeyTouched(true);
    setAnchorTouched(true);
    setIsSectionEditorOpen(true);
    setEditingItemId(null);
    setIsItemEditorOpen(false);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
    setStatusMessage('');
  };

  const startNewSection = () => {
    setIsCreatingSection(true);
    setSelectedSectionId(null);
    setIsSectionEditorOpen(true);
    setSectionForm(getEmptySectionForm(faqOnly));
    setSectionErrors({});
    setSectionKeyTouched(false);
    setAnchorTouched(false);
    setEditingItemId(null);
    setIsItemEditorOpen(false);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
    setStatusMessage('');
  };

  const closeSectionEditor = () => {
    setIsCreatingSection(false);
    setIsSectionEditorOpen(false);
    setSectionErrors({});
    setStatusMessage('');

    if (selectedSection) {
      setSectionForm(mapSectionToForm(selectedSection));
      setSectionKeyTouched(true);
      setAnchorTouched(true);
      return;
    }

    setSectionForm(getEmptySectionForm(faqOnly));
    setSectionKeyTouched(false);
    setAnchorTouched(false);
  };

  const setSectionField = (key, value) => {
    setSectionForm((current) => ({ ...current, [key]: value }));
    setSectionErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const handleSectionLabelChange = (value) => {
    setSectionForm((current) => ({
      ...current,
      label: value,
      section_key: sectionKeyTouched ? current.section_key : slugify(value),
      anchor_id: anchorTouched ? current.anchor_id : slugify(value),
    }));
    setSectionErrors((current) => ({
      ...current,
      label: undefined,
      section_key: undefined,
      anchor_id: undefined,
    }));
    setStatusMessage('');
  };

  const handleSectionSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSection(sectionForm);
    if (Object.keys(nextErrors).length) {
      setSectionErrors(nextErrors);
      return;
    }

    setSectionSaving(true);
    setStatusMessage('');

    try {
      const payload = {
        label: sectionForm.label.trim(),
        section_key: slugify(sectionForm.section_key) || slugify(sectionForm.label),
        anchor_id: slugify(sectionForm.anchor_id) || slugify(sectionForm.section_key) || slugify(sectionForm.label),
        layout_type: faqOnly ? 'faq' : sectionForm.layout_type,
        kicker: normalizeNullableString(sectionForm.kicker),
        title: sectionForm.title.trim(),
        description: normalizeNullableString(sectionForm.description),
        items: selectedSection
          ? serializeSectionItems(sectionItems)
          : faqOnly
            ? serializeSectionItems(getDefaultFaqSectionItems())
            : [],
        is_visible: Boolean(sectionForm.is_visible),
        display_order: selectedSection?.display_order ?? sections.length,
      };

      const savedSection = selectedSection
        ? await updateItem(selectedSection.id, payload)
        : await createItem(payload);

      setIsCreatingSection(false);
      setIsSectionEditorOpen(false);
      setStatusTone('info');
      setStatusMessage(selectedSection ? 'Section updated successfully.' : 'Section created successfully.');
      setSelectedSectionId(savedSection.id);
      setSectionForm(mapSectionToForm(savedSection));
      setSectionKeyTouched(true);
      setAnchorTouched(true);
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save this section.');
    } finally {
      setSectionSaving(false);
    }
  };

  const handleSectionMove = async (index, direction) => {
    try {
      await reorderItems(index, direction);
      setStatusTone('info');
      setStatusMessage('Section order updated.');
    } catch (moveError) {
      setStatusTone('error');
      setStatusMessage(moveError.message || 'Unable to reorder sections.');
    }
  };

  const handleSectionVisibility = async (section, isVisible) => {
    try {
      const updatedSection = await updateItem(section.id, { is_visible: isVisible });
      if (selectedSectionId === section.id) {
        setSectionForm(mapSectionToForm(updatedSection));
      }
      setStatusTone('info');
      setStatusMessage(`${section.label} is now ${isVisible ? 'visible' : 'hidden'} on the website.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update section visibility.');
    }
  };

  const handleDeleteSection = async () => {
    if (!pendingDeleteSection) {
      return;
    }

    try {
      await removeItem(pendingDeleteSection.id);

      if (pendingDeleteSection.id === selectedSectionId) {
        setIsCreatingSection(false);
        setSelectedSectionId(null);
        setIsSectionEditorOpen(false);
        setSectionForm(getEmptySectionForm(faqOnly));
        setEditingItemId(null);
        setIsItemEditorOpen(false);
        setItemForm(EMPTY_ITEM_FORM);
        setItemErrors({});
      }

      setStatusTone('info');
      setStatusMessage('Section deleted successfully.');
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this section.');
    } finally {
      setPendingDeleteSection(null);
    }
  };

  const setItemField = (key, value) => {
    setItemForm((current) => ({ ...current, [key]: value }));
    setItemErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage('');
  };

  const startNewItem = () => {
    setEditingItemId(null);
    setIsItemEditorOpen(true);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
    setStatusMessage('');
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setIsItemEditorOpen(false);
    setItemForm(EMPTY_ITEM_FORM);
    setItemErrors({});
    setStatusMessage('');
  };

  const editItem = (item) => {
    setEditingItemId(item.id);
    setIsItemEditorOpen(true);
    setItemForm(mapItemToForm(item));
    setItemErrors({});
    setStatusMessage('');
  };

  const persistSectionItems = async (nextItems) => {
    if (!selectedSection) {
      throw new Error('Select a section first.');
    }

    const updatedSection = await updateItem(selectedSection.id, {
      items: serializeSectionItems(nextItems),
    });

    setSelectedSectionId(updatedSection.id);
    return updatedSection;
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSection) {
      setStatusTone('error');
      setStatusMessage('Create or select a section before adding items.');
      return;
    }

    const nextErrors = validateItem(itemForm, sectionForm.layout_type);
    if (Object.keys(nextErrors).length) {
      setItemErrors(nextErrors);
      return;
    }

    setItemSaving(true);
    setStatusMessage('');

    try {
      const baseItems = normalizeSectionItems(selectedSection.items);
      const nextItem = {
        id: editingItem?.id || createLocalId(),
        title: itemForm.title.trim(),
        subtitle: sectionForm.layout_type === 'faq' ? '' : itemForm.subtitle.trim(),
        description: itemForm.description.trim(),
        isVisible: Boolean(itemForm.is_visible),
      };

      const nextItems = editingItem
        ? baseItems.map((item) => (item.id === editingItem.id ? { ...item, ...nextItem } : item))
        : [...baseItems, { ...nextItem, displayOrder: baseItems.length }];

      await persistSectionItems(nextItems);
      setStatusTone('info');
      setStatusMessage(editingItem ? 'Item updated successfully.' : 'Item created successfully.');
      resetItemForm();
    } catch (saveError) {
      setStatusTone('error');
      setStatusMessage(saveError.message || 'Unable to save this section item.');
    } finally {
      setItemSaving(false);
    }
  };

  const handleItemVisibility = async (item, isVisible) => {
    if (!selectedSection) {
      return;
    }

    try {
      const nextItems = sectionItems.map((entry) => (
        entry.id === item.id
          ? { ...entry, isVisible }
          : entry
      ));

      await persistSectionItems(nextItems);
      setStatusTone('info');
      setStatusMessage(`${item.title} is now ${isVisible ? 'visible' : 'hidden'} on the website.`);
    } catch (toggleError) {
      setStatusTone('error');
      setStatusMessage(toggleError.message || 'Unable to update item visibility.');
    }
  };

  const handleItemMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sectionItems.length) {
      return;
    }

    try {
      const nextItems = moveItem(sectionItems, index, targetIndex).map((item, orderIndex) => ({
        ...item,
        displayOrder: orderIndex,
      }));

      await persistSectionItems(nextItems);
      setStatusTone('info');
      setStatusMessage('Section item order updated.');
    } catch (moveError) {
      setStatusTone('error');
      setStatusMessage(moveError.message || 'Unable to reorder section items.');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedSection || !pendingDeleteItem) {
      return;
    }

    try {
      const nextItems = sectionItems.filter((item) => item.id !== pendingDeleteItem.id);
      await persistSectionItems(nextItems);

      if (pendingDeleteItem.id === editingItemId) {
        resetItemForm();
      }

      setStatusTone('info');
      setStatusMessage('Section item deleted successfully.');
    } catch (deleteError) {
      setStatusTone('error');
      setStatusMessage(deleteError.message || 'Unable to delete this section item.');
    } finally {
      setPendingDeleteItem(null);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={faqOnly ? DEFAULT_FAQ_SECTION_TITLE : 'Homepage Sections'}
        description={faqOnly
          ? 'Manage the website FAQ heading and the questions visitors see before they apply.'
          : 'Manage reusable homepage sections like About cards and FAQ content from one place. New supported layouts added here will render automatically on the public site.'}
        actions={!faqOnly || !visibleSections.length ? (
          <button
            type="button"
            className="admin-button admin-button-primary admin-button-icon"
            onClick={startNewSection}
            disabled={sectionsUnavailable}
            aria-label={faqOnly ? 'Create FAQ section' : 'Create section'}
            title={faqOnly ? 'Create FAQ section' : 'Create section'}
          >
            <Plus size={18} />
          </button>
        ) : null}
      />

      {statusMessage ? <AdminNotice tone={statusTone}>{statusMessage}</AdminNotice> : null}
      {error ? <AdminNotice tone="error">{error}</AdminNotice> : null}

      <section className={`admin-grid${isSectionEditorOpen ? '' : ' admin-grid-single'}`}>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>{faqOnly ? 'Website FAQ section' : 'All sections'}</h2>
                <p>{faqOnly ? 'This is the Questions Before You Apply block shown on the website.' : 'Select a section to edit its copy, layout, visibility, and nested items.'}</p>
              </div>
            </div>

            {loading ? (
              <div className="admin-loading">
                <div>
                  <div className="admin-loading-spinner" />
                  <p>Loading sections...</p>
                </div>
              </div>
            ) : sectionsUnavailable ? (
              <AdminNotice tone="error">{error}</AdminNotice>
            ) : visibleSections.length === 0 ? (
              <AdminNotice tone="empty">
                {faqOnly
                  ? 'No website FAQ section yet. Use the + button to create Questions Before You Apply.'
                  : 'No managed sections yet. Use the + button to create your first section.'}
              </AdminNotice>
            ) : (
              <div className="admin-record-list">
                {visibleSections.map((section, index) => {
                  const itemsCount = normalizeSectionItems(section.items).length;
                  const isSelected = section.id === selectedSectionId;

                  return (
                    <article
                      key={section.id}
                      className={`admin-record-card${isSelected ? ' is-selected' : ''}`}
                    >
                      <div className="admin-record-top">
                        <div>
                          <div className="admin-record-title">{section.label}</div>
                          <p className="admin-record-subtitle">
                            {section.layout_type === 'faq' ? 'FAQ layout' : 'Cards grid layout'} - #{section.anchor_id}
                          </p>
                          <p className="admin-record-copy" style={{ marginTop: '0.45rem' }}>
                            {section.title}
                          </p>
                        </div>

                        <div className="admin-pill-row">
                          <StatusBadge
                            label={section.is_visible ? 'Visible' : 'Hidden'}
                            tone={section.is_visible ? 'visible' : 'hidden'}
                          />
                          <span className="admin-pill">{itemsCount} items</span>
                        </div>
                      </div>

                      <ToggleSwitch
                        checked={Boolean(section.is_visible)}
                        onChange={(nextValue) => handleSectionVisibility(section, nextValue)}
                        label={section.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                        hint="Hide the section without removing its content."
                      />

                      <div className="admin-actions">
                        {!faqOnly ? (
                          <button
                            type="button"
                            className="admin-button admin-button-icon admin-button-move-up"
                            onClick={() => handleSectionMove(index, 'up')}
                            disabled={index === 0}
                            aria-label={`Move ${section.label} up`}
                            title={`Move ${section.label} up`}
                          >
                            <ArrowUp size={16} />
                          </button>
                        ) : null}
                        {!faqOnly ? (
                          <button
                            type="button"
                            className="admin-button admin-button-icon admin-button-move-down"
                            onClick={() => handleSectionMove(index, 'down')}
                            disabled={index === visibleSections.length - 1}
                            aria-label={`Move ${section.label} down`}
                            title={`Move ${section.label} down`}
                          >
                            <ArrowDown size={16} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="admin-button admin-button-icon admin-button-edit"
                          onClick={() => editSection(section)}
                          aria-label={faqOnly ? 'Edit FAQ section' : `Edit ${section.label}`}
                          title={faqOnly ? 'Edit FAQ section' : `Edit ${section.label}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        {!faqOnly ? (
                          <button
                            type="button"
                            className="admin-button admin-button-danger admin-button-icon"
                            onClick={() => setPendingDeleteSection(section)}
                            aria-label={`Delete ${section.label}`}
                            title={`Delete ${section.label}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {isSectionEditorOpen ? (
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>{faqOnly ? 'FAQ section editor' : 'Section editor'}</h2>
                <p>
                  {faqOnly
                    ? 'Update the heading, intro copy, and visibility for the FAQ block here.'
                    : 'Configure the section itself here, then manage its items below.'}
                </p>
              </div>
            </div>

            {sectionsUnavailable ? (
              <AdminNotice tone="error">
                Resolve the database setup issue before creating or editing sections here.
              </AdminNotice>
            ) : (
              <form className="admin-form" onSubmit={handleSectionSubmit}>
                <div className="admin-form-grid">
                  <AdminField label={faqOnly ? 'FAQ label' : 'Section label'} htmlFor="section_label" error={sectionErrors.label}>
                    <input
                      id="section_label"
                      className="admin-input"
                      value={sectionForm.label}
                      onChange={(event) => handleSectionLabelChange(event.target.value)}
                      placeholder={faqOnly ? 'FAQ' : 'How We Build'}
                    />
                  </AdminField>

                  {!faqOnly ? (
                    <AdminField label="Layout type" htmlFor="section_layout">
                      <select
                        id="section_layout"
                        className="admin-select"
                        value={sectionForm.layout_type}
                        onChange={(event) => setSectionField('layout_type', event.target.value)}
                      >
                        {SECTION_LAYOUT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                  ) : null}
                </div>

                <div className="admin-form-grid">
                  <AdminField
                    label="Section key"
                    htmlFor="section_key"
                    description="Used as the internal identifier for this section."
                    error={sectionErrors.section_key}
                  >
                    <input
                      id="section_key"
                      className="admin-input"
                      value={sectionForm.section_key}
                      onChange={(event) => {
                        setSectionKeyTouched(true);
                        setSectionField('section_key', event.target.value);
                      }}
                      placeholder={faqOnly ? 'faq' : 'how-we-build'}
                    />
                  </AdminField>

                  <AdminField
                    label="Anchor id"
                    htmlFor="section_anchor"
                    description="Used for in-page links like #about or #faq."
                    error={sectionErrors.anchor_id}
                  >
                    <input
                      id="section_anchor"
                      className="admin-input"
                      value={sectionForm.anchor_id}
                      onChange={(event) => {
                        setAnchorTouched(true);
                        setSectionField('anchor_id', event.target.value);
                      }}
                      placeholder={faqOnly ? 'faq' : 'about'}
                    />
                  </AdminField>
                </div>

                <AdminField label="Kicker" htmlFor="section_kicker">
                  <input
                    id="section_kicker"
                    className="admin-input"
                    value={sectionForm.kicker}
                    onChange={(event) => setSectionField('kicker', event.target.value)}
                    placeholder={faqOnly ? 'FAQ' : 'About Us'}
                  />
                </AdminField>

                <AdminField label={faqOnly ? 'FAQ title' : 'Section title'} htmlFor="section_title" error={sectionErrors.title}>
                  <input
                    id="section_title"
                    className="admin-input"
                    value={sectionForm.title}
                    onChange={(event) => setSectionField('title', event.target.value)}
                    placeholder={faqOnly ? 'Common questions' : 'How we build'}
                  />
                </AdminField>

                <AdminField
                  label={faqOnly ? 'FAQ description' : 'Section description'}
                  htmlFor="section_description"
                  description={faqOnly ? 'This copy appears above the FAQ list on the public site.' : SECTION_LAYOUT_OPTIONS.find((option) => option.value === sectionForm.layout_type)?.description}
                >
                  <textarea
                    id="section_description"
                    className="admin-textarea"
                    value={sectionForm.description}
                    onChange={(event) => setSectionField('description', event.target.value)}
                    placeholder="Describe what visitors should understand from this section."
                  />
                </AdminField>

                <ToggleSwitch
                  checked={sectionForm.is_visible}
                  onChange={(nextValue) => setSectionField('is_visible', nextValue)}
                  label={sectionForm.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                  hint="Supported layouts render automatically when the section is visible."
                />

                <div className="admin-form-actions">
                  <button type="button" className="admin-button admin-button-ghost" onClick={closeSectionEditor}>
                    {selectedSection ? 'Cancel edit' : 'Cancel'}
                  </button>
                  <button type="submit" className="admin-button admin-button-primary" disabled={sectionSaving}>
                    <Save size={16} />
                    <span>{sectionSaving ? 'Saving...' : selectedSection ? `Save ${faqOnly ? 'FAQ section' : 'section'}` : `Create ${faqOnly ? 'FAQ section' : 'section'}`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        ) : null}
      </section>

      <section className={`admin-grid${isItemEditorOpen ? '' : ' admin-grid-single'}`}>
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>{faqOnly ? 'Questions' : 'Section items'}</h2>
                <p>
                  {selectedSection
                    ? faqOnly
                      ? 'Add, remove, reorder, or edit the questions shown in Questions Before You Apply.'
                      : `These entries feed ${selectedSection.label} on the public website.`
                    : `Create or select a ${faqOnly ? 'FAQ section' : 'section'} first to manage its items.`}
                </p>
              </div>
              {selectedSection ? (
                <button
                  type="button"
                  className="admin-button admin-button-primary admin-button-icon"
                  onClick={startNewItem}
                  aria-label={faqOnly ? 'Create question' : 'Create item'}
                  title={faqOnly ? 'Create question' : 'Create item'}
                >
                  <Plus size={18} />
                </button>
              ) : null}
            </div>

            {sectionsUnavailable ? (
              <AdminNotice tone="error">
                Resolve the database setup issue before managing section items.
              </AdminNotice>
            ) : !selectedSection ? (
              <AdminNotice tone="empty">
                {faqOnly ? 'Choose an FAQ section above to edit its questions and answers.' : 'Choose a section above to edit the cards or FAQs inside it.'}
              </AdminNotice>
            ) : sectionItems.length === 0 ? (
              <AdminNotice tone="empty">
                No items yet. Use the + button to add the first {selectedSection.layout_type === 'faq' ? 'question' : 'card'}.
              </AdminNotice>
            ) : (
              <div className="admin-record-list">
                {sectionItems.map((item, index) => (
                  <article key={item.id} className="admin-record-card">
                    <div className="admin-record-top">
                      <div>
                        <div className="admin-record-title">{item.title}</div>
                        {item.subtitle ? <p className="admin-record-subtitle">{item.subtitle}</p> : null}
                        <p className="admin-record-copy" style={{ marginTop: '0.45rem' }}>
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
                      hint="You can hide an individual item without removing it."
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
                        disabled={index === sectionItems.length - 1}
                        aria-label={`Move ${item.title} down`}
                        title={`Move ${item.title} down`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-icon admin-button-edit"
                        onClick={() => editItem(item)}
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

        {isItemEditorOpen ? (
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="admin-card-header">
              <div>
                <h2>{faqOnly ? 'Question editor' : 'Item editor'}</h2>
                <p>
                  {!selectedSection
                    ? `${faqOnly ? 'Questions' : 'Section items'} become available once a section is selected.`
                    : faqOnly
                      ? 'Use this form to manage the questions and answers shown in Questions Before You Apply.'
                      : `Use this form to update ${selectedSection.layout_type === 'faq' ? 'questions and answers' : 'card content'} inside ${selectedSection.label}.`}
                </p>
              </div>
            </div>

            {sectionsUnavailable ? (
              <AdminNotice tone="error">
                Resolve the database setup issue before creating or editing section items.
              </AdminNotice>
            ) : !selectedSection ? (
              <AdminNotice tone="empty">
                {faqOnly ? 'Save or select an FAQ section before adding items.' : 'Save or select a section before adding items.'}
              </AdminNotice>
            ) : (
              <form className="admin-form" onSubmit={handleItemSubmit}>
                <AdminField label={itemLabels.title} htmlFor="section_item_title" error={itemErrors.title}>
                  <input
                    id="section_item_title"
                    className="admin-input"
                    value={itemForm.title}
                    onChange={(event) => setItemField('title', event.target.value)}
                    placeholder={itemLabels.titlePlaceholder}
                  />
                </AdminField>

                {selectedSection.layout_type !== 'faq' ? (
                  <AdminField
                    label={itemLabels.subtitle}
                    htmlFor="section_item_subtitle"
                    description="A short supporting label shown above the item title."
                  >
                    <input
                      id="section_item_subtitle"
                      className="admin-input"
                      value={itemForm.subtitle}
                      onChange={(event) => setItemField('subtitle', event.target.value)}
                      placeholder={itemLabels.subtitlePlaceholder}
                    />
                  </AdminField>
                ) : null}

                <AdminField label={itemLabels.description} htmlFor="section_item_description" error={itemErrors.description}>
                  <textarea
                    id="section_item_description"
                    className="admin-textarea"
                    value={itemForm.description}
                    onChange={(event) => setItemField('description', event.target.value)}
                    placeholder={itemLabels.descriptionPlaceholder}
                  />
                </AdminField>

                <ToggleSwitch
                  checked={itemForm.is_visible}
                  onChange={(nextValue) => setItemField('is_visible', nextValue)}
                  label={itemForm.is_visible ? 'Visible on the website' : 'Hidden from the website'}
                  hint="Hide an item while keeping it saved inside the section."
                />

                <div className="admin-form-actions">
                  <button type="button" className="admin-button admin-button-ghost" onClick={resetItemForm}>
                    {editingItem ? 'Cancel edit' : 'Cancel'}
                  </button>
                  <button type="submit" className="admin-button admin-button-primary" disabled={itemSaving}>
                    <Save size={16} />
                    <span>{itemSaving ? 'Saving...' : editingItem ? 'Save item' : 'Create item'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDeleteSection)}
        title="Delete section?"
        description={`This will permanently remove ${pendingDeleteSection?.label || 'this section'} and all of its nested items.`}
        confirmLabel="Delete section"
        onConfirm={handleDeleteSection}
        onCancel={() => setPendingDeleteSection(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteItem)}
        title="Delete section item?"
        description={`This will permanently remove ${pendingDeleteItem?.title || 'this item'} from the selected section.`}
        confirmLabel="Delete item"
        onConfirm={handleDeleteItem}
        onCancel={() => setPendingDeleteItem(null)}
      />
    </div>
  );
}


