import { createClient } from '@supabase/supabase-js';

const APPLY_TABLE = 'Applications';
const ALLOWED_CONTENT_TYPES = ['application/json'];
const ALLOWED_DOMAINS = new Set([
  'Frontend Development',
  'Backend Development',
  'App Development',
  'AI/ML',
  'Cloud',
  'Cyber Security',
  'UI/UX',
]);
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://code-catalysts.vercel.app',
]);
const FIELD_LIMITS = {
  name: 120,
  email: 254,
  year: 24,
  college: 160,
  branch: 160,
  github: 300,
  linkedin: 300,
  domain: 64,
  techStack: 2000,
  whyJoin: 4000,
  project: 4000,
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeOrigin = (value) => normalizeString(value).replace(/\/$/, '');

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

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const getAllowedOrigins = () => {
  const configuredOrigins = normalizeString(process.env.APPLY_ALLOWED_ORIGINS)
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]);

  if (process.env.VERCEL_URL) {
    allowedOrigins.add(`https://${normalizeOrigin(process.env.VERCEL_URL)}`);
  }

  return allowedOrigins;
};

const requestOriginMatchesHost = (req, origin) => {
  if (!origin) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const forwardedHost = normalizeString(req.headers['x-forwarded-host']);
    const host = forwardedHost || normalizeString(req.headers.host);
    return Boolean(host) && parsedOrigin.host === host;
  } catch {
    return false;
  }
};

const isAllowedOrigin = (req, origin) => {
  if (!origin) {
    return true;
  }

  return requestOriginMatchesHost(req, origin) || getAllowedOrigins().has(normalizeOrigin(origin));
};

const applyCorsHeaders = (req, res) => {
  const origin = normalizeOrigin(req.headers.origin);

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (origin && isAllowedOrigin(req, origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  return origin;
};

const isExpectedJsonRequest = (contentType) => ALLOWED_CONTENT_TYPES.some((value) => contentType.includes(value));

const isWithinLimit = (value, key) => normalizeString(value).length <= FIELD_LIMITS[key];

export default async function handler(req, res) {
  const origin = applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(isAllowedOrigin(req, origin) ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAllowedOrigin(req, origin)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }

  const contentType = normalizeString(req.headers['content-type']).toLowerCase();
  if (!isExpectedJsonRequest(contentType)) {
    return res.status(415).json({ error: 'Requests must use application/json.' });
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

    const limitedFields = ['name', 'email', 'year', 'college', 'branch', 'domain', 'techStack', 'whyJoin', 'project'];
    const invalidLengthField = limitedFields.find((field) => !isWithinLimit(data[field], field))
      || (normalizeString(data.github) && !isWithinLimit(data.github, 'github') ? 'github' : '')
      || (normalizeString(data.linkedin) && !isWithinLimit(data.linkedin, 'linkedin') ? 'linkedin' : '');

    if (invalidLengthField) {
      return res.status(400).json({ error: `The ${invalidLengthField} field is too long.` });
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
