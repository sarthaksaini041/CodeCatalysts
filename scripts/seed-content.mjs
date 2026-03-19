import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { journeyTimeline, projectData, siteSettings, teamData } from '../website/src/data.js';
import { slugify } from '../website/src/utils/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

function loadDotEnvFile() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, 'utf8');

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

loadDotEnvFile();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (
  process.env.SUPABASE_SECRET_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || ''
).trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function mapMember(member, index) {
  return {
    name: member.name,
    role: member.role,
    department: member.department,
    short_bio: member.bio || '',
    image_url: member.image || null,
    image_path: null,
    email: null,
    github_url: member.github || null,
    linkedin_url: member.linkedin || null,
    instagram_url: member.instagram || null,
    twitter_url: member.twitter || null,
    skills: Array.isArray(member.skills) ? member.skills : [],
    display_order: index,
    is_visible: true,
  };
}

function mapProject(project, index) {
  return {
    title: project.title,
    slug: project.slug || slugify(project.title),
    short_description: project.shortDescription || project.short_description || '',
    full_description: project.fullDescription || project.full_description || null,
    image_url: project.image || project.image_url || null,
    image_path: null,
    tech_stack: Array.isArray(project.techStack || project.tech_stack)
      ? (project.techStack || project.tech_stack)
      : [],
    github_url: project.githubUrl || project.github_url || null,
    live_url: project.liveUrl || project.live_url || null,
    category: project.category || null,
    status: project.status || null,
    featured: Boolean(project.featured),
    display_order: index,
    is_visible: project.isVisible ?? true,
  };
}

function mapJourney(item, index) {
  return {
    title: item.title,
    date_label: item.date || item.date_label || '',
    description: item.description || '',
    icon_name: item.iconName || item.icon_name || null,
    display_order: index,
    is_visible: item.isVisible ?? true,
  };
}

async function tableHasRows(table) {
  const { data, error } = await supabase.from(table).select('id').limit(1);

  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}

async function seedTableIfEmpty(table, rows) {
  if (!rows.length) {
    console.log(`Skipping ${table}: no seed rows defined.`);
    return;
  }

  if (await tableHasRows(table)) {
    console.log(`Skipping ${table}: table already has content.`);
    return;
  }

  const { error } = await supabase.from(table).insert(rows);

  if (error) {
    throw error;
  }

  console.log(`Seeded ${rows.length} rows into ${table}.`);
}

async function upsertSettings() {
  const payload = {
    id: 1,
    hero_title: siteSettings.heroTitle,
    hero_subtitle: siteSettings.heroSubtitle,
    contact_email: siteSettings.contactEmail,
    github_url: siteSettings.githubUrl || null,
    linkedin_url: siteSettings.linkedinUrl || null,
    instagram_url: siteSettings.instagramUrl || null,
    footer_text: siteSettings.footerText,
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert([payload], { onConflict: 'id' });

  if (error) {
    throw error;
  }

  console.log('Upserted site_settings.');
}

async function main() {
  await seedTableIfEmpty('members', teamData.map(mapMember));
  await seedTableIfEmpty('projects', projectData.map(mapProject));
  await seedTableIfEmpty('journey_entries', journeyTimeline.map(mapJourney));
  await upsertSettings();
  console.log('Content seed complete.');
}

main().catch((error) => {
  console.error('Content seed failed:', error.message || error);
  process.exit(1);
});
