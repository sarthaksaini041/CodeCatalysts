import { hasSupabaseBrowserConfig, requireSupabaseBrowserClient } from './supabase';

export async function getCurrentSession() {
  if (!hasSupabaseBrowserConfig) {
    return null;
  }

  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithPassword(email, password) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOutAdmin() {
  if (!hasSupabaseBrowserConfig) {
    return;
  }

  const client = requireSupabaseBrowserClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function checkAdminAccess(userId) {
  if (!userId || !hasSupabaseBrowserConfig) {
    return false;
  }

  const client = requireSupabaseBrowserClient();
  const { data, error } = await client
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getCurrentAdminState() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return {
      session: null,
      user: null,
      isAdmin: false,
    };
  }

  const isAdmin = await checkAdminAccess(session.user.id);
  return {
    session: isAdmin ? session : null,
    user: session.user,
    isAdmin,
  };
}
