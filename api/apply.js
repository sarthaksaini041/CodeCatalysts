import { createClient } from '@supabase/supabase-js';

const APPLY_TABLE = 'Applications';

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({
      error: 'Database configuration missing from server. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
    });
  }

  try {
    const data = req.body;

    if (!data.name?.trim() || !data.email?.trim() || !data.domain || !data.techStack?.trim()) {
      return res.status(400).json({ error: 'Missing required fundamental fields.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const isValidUrl = (url) => {
      if (!url) return true;

      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(data.github) || !isValidUrl(data.linkedin)) {
      return res.status(400).json({ error: 'Invalid social profile URLs.' });
    }

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      year: data.year || '',
      college: data.college ? data.college.trim() : '',
      branch: data.branch ? data.branch.trim() : '',
      github: data.github ? data.github.trim() : '',
      linkedin: data.linkedin ? data.linkedin.trim() : '',
      portfolio: '',
      domain: data.domain,
      tech_stack: data.techStack ? data.techStack.trim() : '',
      why_join: data.whyJoin ? data.whyJoin.trim() : '',
      project: data.project ? data.project.trim() : '',
    };

    const { error } = await supabase.from(APPLY_TABLE).insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Could not save application right now.' });
    }

    return res.status(200).json({ ok: true, message: 'Application submitted securely.' });
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: 'Failed to process application' });
  }
}
