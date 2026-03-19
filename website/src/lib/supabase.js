import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || ''
).trim();

export const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET?.trim() || 'content-media';
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
