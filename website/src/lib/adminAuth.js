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

export async function requestAdminPasswordReset(email, redirectTo) {
  const client = requireSupabaseBrowserClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}

export async function connectAdminRecoverySessionFromUrl() {
  if (!hasSupabaseBrowserConfig || typeof window === 'undefined') {
    return false;
  }

  const client = requireSupabaseBrowserClient();
  const url = new URL(window.location.href);
  const authCode = url.searchParams.get('code');

  if (authCode) {
    const { error } = await client.auth.exchangeCodeForSession(authCode);

    if (error) {
      throw error;
    }

    return true;
  }

  const tokenHash = url.searchParams.get('token_hash');
  const recoveryType = url.searchParams.get('type');

  if (tokenHash && recoveryType === 'recovery') {
    const { error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });

    if (error) {
      throw error;
    }

    return true;
  }

  return false;
}

export async function updateAdminPassword(password) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.updateUser({ password });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function updateAdminProfile({ displayName, username }) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.auth.updateUser({
    data: {
      display_name: displayName || null,
      full_name: displayName || null,
      name: displayName || null,
      username: username || null,
      user_name: username || null,
      preferred_username: username || null,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
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
