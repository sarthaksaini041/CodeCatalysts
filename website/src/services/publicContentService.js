import {
  hasSupabaseBrowserConfig,
  requireSupabaseBrowserClient,
} from '../lib/supabase';
import {
  howWeBuild,
  journeyTimeline,
  projectData,
  siteSettings as fallbackSiteSettings,
  teamData,
} from '../data';
import { getDefaultFaqSection, loadManagedFaqSection } from './faqContentService';
import { slugify, toDisplayOrder } from '../utils/content';

function sortByDisplayOrder(items) {
  return [...items].sort((left, right) => {
    const orderDifference = (left.displayOrder ?? 0) - (right.displayOrder ?? 0);
    if (orderDifference !== 0) {
      return orderDifference;
    }

    return String(left.title || '').localeCompare(String(right.title || ''));
  });
}

function mapMemberRecord(record) {
  return {
    id: record.id,
    name: record.name,
    role: record.role,
    department: record.department,
    bio: record.short_bio || '',
    image: record.image_url || '',
    imagePath: record.image_path || '',
    email: record.email || '',
    github: record.github_url || '',
    linkedin: record.linkedin_url || '',
    instagram: record.instagram_url || '',
    twitter: record.twitter_url || '',
    skills: Array.isArray(record.skills) ? record.skills : [],
    displayOrder: record.display_order ?? 0,
    isVisible: Boolean(record.is_visible),
  };
}

function mapProjectRecord(record) {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    shortDescription: record.short_description || '',
    fullDescription: record.full_description || '',
    image: record.image_url || '',
    imagePath: record.image_path || '',
    techStack: Array.isArray(record.tech_stack) ? record.tech_stack : [],
    githubUrl: record.github_url || '',
    liveUrl: record.live_url || '',
    category: record.category || '',
    status: record.status || '',
    featured: Boolean(record.featured),
    displayOrder: record.display_order ?? 0,
    isVisible: Boolean(record.is_visible),
  };
}

function mapJourneyRecord(record) {
  return {
    id: record.id,
    title: record.title,
    date: record.date_label,
    description: record.description,
    iconName: record.icon_name || '',
    displayOrder: record.display_order ?? 0,
    isVisible: Boolean(record.is_visible),
  };
}

function mapSiteSettingsRecord(record) {
  const fallbackBrandLinks = Array.isArray(fallbackSiteSettings.brandLinks)
    ? fallbackSiteSettings.brandLinks
    : [];
  const brandLinks = [
    {
      label: record?.brand_primary_label || fallbackBrandLinks[0]?.label || '',
      url: record?.brand_primary_url || fallbackBrandLinks[0]?.url || '',
    },
    {
      label: record?.brand_secondary_label || fallbackBrandLinks[1]?.label || '',
      url: record?.brand_secondary_url || fallbackBrandLinks[1]?.url || '',
    },
  ].filter((item) => item.label && item.url);

  return {
    heroTitle: record?.hero_title || fallbackSiteSettings.heroTitle,
    heroSubtitle: record?.hero_subtitle || fallbackSiteSettings.heroSubtitle,
    contactEmail: record?.contact_email || fallbackSiteSettings.contactEmail,
    githubUrl: record?.github_url || fallbackSiteSettings.githubUrl,
    linkedinUrl: record?.linkedin_url || fallbackSiteSettings.linkedinUrl,
    instagramUrl: record?.instagram_url || fallbackSiteSettings.instagramUrl,
    twitterUrl: record?.twitter_url || fallbackSiteSettings.twitterUrl,
    footerText: record?.footer_text || fallbackSiteSettings.footerText,
    ctaButtonText: record?.cta_button_text || fallbackSiteSettings.ctaButtonText,
    brandLinks,
  };
}

function mapSectionItemRecord(record, index = 0) {
  return {
    id: record?.id || `section-item-${index}`,
    title: record?.title || record?.question || '',
    subtitle: record?.subtitle || record?.tag || '',
    description: record?.description || record?.answer || '',
    displayOrder: toDisplayOrder(record?.display_order ?? record?.displayOrder, index),
    isVisible: record?.is_visible ?? record?.isVisible ?? true,
  };
}

function normalizeSectionItems(items, { publicOnly = true } = {}) {
  const normalized = sortByDisplayOrder(
    (Array.isArray(items) ? items : []).map((item, index) => mapSectionItemRecord(item, index)),
  );

  if (!publicOnly) {
    return normalized;
  }

  return normalized.filter((item) => item.isVisible);
}

function mapSiteSectionRecord(record, { publicOnly = true } = {}) {
  const sectionKey = record?.section_key || record?.sectionKey || slugify(record?.label || record?.title || 'section');

  return {
    id: record?.id || sectionKey,
    sectionKey,
    anchorId: record?.anchor_id || record?.anchorId || slugify(sectionKey),
    label: record?.label || record?.title || sectionKey,
    layoutType: record?.layout_type || record?.layoutType || 'card_grid',
    kicker: record?.kicker || '',
    title: record?.title || '',
    description: record?.description || '',
    displayOrder: toDisplayOrder(record?.display_order ?? record?.displayOrder, 0),
    isVisible: record?.is_visible ?? record?.isVisible ?? true,
    items: normalizeSectionItems(record?.items, { publicOnly }),
  };
}

function createSectionMap(sectionList) {
  return sectionList.reduce((lookup, section) => {
    lookup[section.sectionKey] = section;
    return lookup;
  }, {});
}

function mergeFaqSection(sectionList, faqSection) {
  const baseSections = sectionList.filter((section) => (
    section.sectionKey !== 'faq' && section.layoutType !== 'faq'
  ));

  if (!faqSection?.isVisible) {
    return baseSections;
  }

  return sortByDisplayOrder([...baseSections, faqSection]);
}

function buildFallbackSections(faqSection = getDefaultFaqSection()) {
  const sections = [
    {
      id: 'fallback-how-we-build',
      sectionKey: 'how_we_build',
      anchorId: 'about',
      label: 'How We Build',
      layoutType: 'card_grid',
      kicker: 'About Us',
      title: 'How we build',
      description: 'A small team learning big things and building what we wish existed.',
      displayOrder: 0,
      isVisible: true,
      items: howWeBuild.map((item, index) => ({
        id: `fallback-how-we-build-${index}`,
        title: item.title,
        subtitle: item.tag,
        description: item.description,
        displayOrder: index,
        isVisible: true,
      })),
    },
  ];

  return mergeFaqSection(
    sections.map((section) => mapSiteSectionRecord(section)),
    faqSection,
  );
}

export function getDefaultPublicContent() {
  const sectionList = buildFallbackSections(getDefaultFaqSection());

  return {
    members: teamData,
    projects: projectData,
    journey: journeyTimeline,
    siteSettings: fallbackSiteSettings,
    sectionList,
    sectionMap: createSectionMap(sectionList),
    loading: false,
    source: 'fallback',
    error: null,
  };
}

export function getInitialPublicContentState() {
  if (!hasSupabaseBrowserConfig) {
    return getDefaultPublicContent();
  }

  return {
    members: [],
    projects: [],
    journey: [],
    siteSettings: fallbackSiteSettings,
    sectionList: [],
    sectionMap: {},
    loading: true,
    source: 'loading',
    error: null,
  };
}

export async function getPublicWebsiteContent() {
  if (!hasSupabaseBrowserConfig) {
    return getDefaultPublicContent();
  }

  const client = requireSupabaseBrowserClient();

  try {
    const [membersResult, projectsResult, journeyResult, settingsResult, sectionsResult, faqSection] = await Promise.all([
      client
        .from('members')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
      client
        .from('projects')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
      client
        .from('journey_entries')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
      client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      client
        .from('site_sections')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
      loadManagedFaqSection(),
    ]);

    const firstError = [
      membersResult.error,
      projectsResult.error,
      journeyResult.error,
      settingsResult.error,
    ].find(Boolean);

    if (firstError) {
      throw firstError;
    }

    const sectionList = sectionsResult.error
      ? buildFallbackSections(faqSection)
      : mergeFaqSection(
          (sectionsResult.data || []).map((record) => mapSiteSectionRecord(record)),
          faqSection,
        );

    return {
      members: (membersResult.data || []).map(mapMemberRecord),
      projects: (projectsResult.data || []).map(mapProjectRecord),
      journey: (journeyResult.data || []).map(mapJourneyRecord),
      siteSettings: mapSiteSettingsRecord(settingsResult.data),
      sectionList,
      sectionMap: createSectionMap(sectionList),
      loading: false,
      source: sectionsResult.error ? 'supabase-sections-fallback' : 'supabase',
      error: null,
    };
  } catch (error) {
    return {
      ...getDefaultPublicContent(),
      error,
    };
  }
}
