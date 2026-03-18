import { createClient } from '@supabase/supabase-js';

const APPLY_TABLE = 'Applications';
const ALLOWED_DOMAINS = new Set([
  'Frontend Development',
  'Backend Development',
  'App Development',
  'AI/ML',
  'Cloud',
  'Cyber Security',
  'UI/UX',
]);

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeProfileUrl = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return '';
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

const getSupabase = () => {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({
      error: 'Database configuration missing from server. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
    });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid request payload.' });
    }

    const name = normalizeString(data.name);
    const email = normalizeString(data.email);
    const year = normalizeString(data.year);
    const college = normalizeString(data.college);
    const branch = normalizeString(data.branch);
    const github = normalizeProfileUrl(data.github);
    const linkedin = normalizeProfileUrl(data.linkedin);
    const domain = normalizeString(data.domain);
    const techStack = normalizeString(data.techStack);
    const whyJoin = normalizeString(data.whyJoin);
    const project = normalizeString(data.project);

    if (!name || !email || !domain || !techStack) {
      return res.status(400).json({ error: 'Missing required fundamental fields.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!ALLOWED_DOMAINS.has(domain)) {
      return res.status(400).json({ error: 'Invalid application domain selected.' });
    }

    if ((normalizeString(data.github) && !github) || (normalizeString(data.linkedin) && !linkedin)) {
      return res.status(400).json({ error: 'Invalid social profile URLs.' });
    }

    const payload = {
      name,
      email,
      year,
      college,
      branch,
      github,
      linkedin,
      portfolio: '',
      domain,
      tech_stack: techStack,
      why_join: whyJoin,
      project,
    };

    const { error } = await supabase.from(APPLY_TABLE).insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Could not save application right now.' });
    }

    return res.status(200).json({ ok: true, message: 'Application submitted securely.' });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }

    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: 'Failed to process application' });
  }
}
