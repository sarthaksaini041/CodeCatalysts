import {
  hasSupabaseBrowserConfig,
  requireSupabaseBrowserClient,
} from '../lib/supabase';
import {
  journeyTimeline,
  projectData,
  siteSettings as fallbackSiteSettings,
  teamData,
} from '../data';

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
  return {
    heroTitle: record?.hero_title || fallbackSiteSettings.heroTitle,
    heroSubtitle: record?.hero_subtitle || fallbackSiteSettings.heroSubtitle,
    contactEmail: record?.contact_email || fallbackSiteSettings.contactEmail,
    githubUrl: record?.github_url || fallbackSiteSettings.githubUrl,
    linkedinUrl: record?.linkedin_url || fallbackSiteSettings.linkedinUrl,
    instagramUrl: record?.instagram_url || fallbackSiteSettings.instagramUrl,
    footerText: record?.footer_text || fallbackSiteSettings.footerText,
  };
}

export function getDefaultPublicContent() {
  return {
    members: teamData,
    projects: projectData,
    journey: journeyTimeline,
    siteSettings: fallbackSiteSettings,
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
    const [membersResult, projectsResult, journeyResult, settingsResult] = await Promise.all([
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

    return {
      members: (membersResult.data || []).map(mapMemberRecord),
      projects: (projectsResult.data || []).map(mapProjectRecord),
      journey: (journeyResult.data || []).map(mapJourneyRecord),
      siteSettings: mapSiteSettingsRecord(settingsResult.data),
      loading: false,
      source: 'supabase',
      error: null,
    };
  } catch (error) {
    return {
      ...getDefaultPublicContent(),
      error,
    };
  }
}
