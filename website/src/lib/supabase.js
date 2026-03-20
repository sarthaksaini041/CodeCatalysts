import { createClient } from '@supabase/supabase-js';

function normalizeEnvValue(value) {
  const trimmed = String(value || '').trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

const supabaseUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = (
  normalizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
  || normalizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  || ''
);

export const storageBucket = normalizeEnvValue(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET) || 'content-media';
export const hasSupabaseBrowserConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase = hasSupabaseBrowserConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabaseBrowserClient() {
  if (!supabase) {
    throw new Error(
      'Supabase browser configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  return supabase;
}

export function getPublicImageUrl(path) {
  if (!path || !supabase) {
    return '';
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(path);
  return data.publicUrl;
}
