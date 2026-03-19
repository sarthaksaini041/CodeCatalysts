import { faqItems } from '../data';
import { requireSupabaseBrowserClient, storageBucket } from '../lib/supabase';
import { toDisplayOrder } from '../utils/content';

export const FAQ_STORAGE_PATH = 'site-content/faqs.json';
export const FAQ_SECTION_KEY = 'faq';

const DEFAULT_FAQ_SECTION = {
  sectionKey: FAQ_SECTION_KEY,
  anchorId: FAQ_SECTION_KEY,
  label: 'FAQ',
  layoutType: 'faq',
  kicker: 'FAQ',
  title: 'Questions Before You Apply',
  description: 'A few quick answers about joining the team, the application flow, and what we look for.',
  displayOrder: 1,
  isVisible: true,
  items: faqItems.map((item, index) => ({
    id: `faq-default-${index + 1}`,
    title: item.question,
    subtitle: '',
    description: item.answer,
    displayOrder: index,
    isVisible: true,
  })),
};

function normalizeFaqItem(item, index = 0) {
  return {
    id: item?.id || `faq-item-${index + 1}`,
    title: String(item?.title || item?.question || '').trim(),
    subtitle: String(item?.subtitle || '').trim(),
    description: String(item?.description || item?.answer || '').trim(),
    displayOrder: toDisplayOrder(item?.displayOrder ?? item?.display_order, index),
    isVisible: item?.isVisible ?? item?.is_visible ?? true,
  };
}

function sortFaqItems(items = []) {
  return [...items].sort((left, right) => {
    const orderDifference = left.displayOrder - right.displayOrder;
    if (orderDifference !== 0) {
      return orderDifference;
    }

    return String(left.title || '').localeCompare(String(right.title || ''));
  });
}

export function getDefaultFaqSection() {
  return {
    ...DEFAULT_FAQ_SECTION,
    items: sortFaqItems(DEFAULT_FAQ_SECTION.items.map((item, index) => normalizeFaqItem(item, index))),
  };
}

export function normalizeFaqSection(section) {
  const fallback = getDefaultFaqSection();
  const items = sortFaqItems(
    (Array.isArray(section?.items) ? section.items : fallback.items).map((item, index) => normalizeFaqItem(item, index)),
  );

  return {
    sectionKey: FAQ_SECTION_KEY,
    anchorId: String(section?.anchorId || section?.anchor_id || fallback.anchorId).trim() || FAQ_SECTION_KEY,
    label: String(section?.label || fallback.label).trim() || fallback.label,
    layoutType: 'faq',
    kicker: String(section?.kicker || fallback.kicker).trim() || fallback.kicker,
    title: String(section?.title || fallback.title).trim() || fallback.title,
    description: String(section?.description || fallback.description).trim() || fallback.description,
    displayOrder: toDisplayOrder(section?.displayOrder ?? section?.display_order, fallback.displayOrder),
    isVisible: true,
    items,
  };
}

function shouldUseFallback(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.statusCode === 404
    || message.includes('not found')
    || message.includes('object not found')
    || message.includes('no such object');
}

async function readFaqContentFile() {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.storage.from(storageBucket).download(FAQ_STORAGE_PATH);

  if (error) {
    if (shouldUseFallback(error)) {
      return null;
    }

    throw error;
  }

  const rawText = await data.text();
  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

export async function loadManagedFaqSection() {
  try {
    const content = await readFaqContentFile();
    return normalizeFaqSection(content);
  } catch {
    return getDefaultFaqSection();
  }
}

function serializeFaqSection(section) {
  const normalized = normalizeFaqSection(section);

  return {
    sectionKey: normalized.sectionKey,
    anchorId: normalized.anchorId,
    label: normalized.label,
    layoutType: normalized.layoutType,
    kicker: normalized.kicker,
    title: normalized.title,
    description: normalized.description,
    displayOrder: normalized.displayOrder,
    isVisible: true,
    items: normalized.items.map((item, index) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description,
      displayOrder: index,
      isVisible: Boolean(item.isVisible),
    })),
  };
}

export async function saveManagedFaqSection(section) {
  const client = requireSupabaseBrowserClient();
  const payload = serializeFaqSection(section);
  const file = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const { error } = await client.storage.from(storageBucket).upload(FAQ_STORAGE_PATH, file, {
    upsert: true,
    contentType: 'application/json',
    cacheControl: '60',
  });

  if (error) {
    throw error;
  }

  return normalizeFaqSection(payload);
}
