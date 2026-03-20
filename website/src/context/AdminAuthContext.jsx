/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentAdminState,
  signInWithPassword,
  signOutAdmin,
} from '../lib/adminAuth';
import { hasSupabaseBrowserConfig, supabase } from '../lib/supabase';

const missingConfigMessage = 'Supabase browser configuration is missing for admin access.';

function getNormalizedAdminAuthErrorMessage(error) {
  const message = String(error?.message || '').trim();
  const normalized = message.toLowerCase();

  if (
    normalized === 'failed to fetch'
    || normalized.includes('networkerror')
    || normalized.includes('network request failed')
    || normalized.includes('load failed')
  ) {
    return 'Cannot reach Supabase from this deployment. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in Vercel Production (no quotes), then redeploy.';
  }

  return message || 'Unable to verify the admin session.';
}

const AdminAuthContext = createContext({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AdminAuthProvider({ children }) {
  const [state, setState] = useState({
    session: null,
    user: null,
    isAdmin: false,
    isLoading: hasSupabaseBrowserConfig,
    error: hasSupabaseBrowserConfig ? null : missingConfigMessage,
  });

  const refreshSession = useCallback(async () => {
    if (!hasSupabaseBrowserConfig) {
      setState({
        session: null,
        user: null,
        isAdmin: false,
        isLoading: false,
        error: missingConfigMessage,
      });
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    try {
      const adminState = await getCurrentAdminState();

      if (!adminState.isAdmin && adminState.user) {
        await signOutAdmin();
      }

      startTransition(() => {
        setState({
          session: adminState.isAdmin ? adminState.session : null,
          user: adminState.isAdmin ? adminState.user : null,
          isAdmin: adminState.isAdmin,
          isLoading: false,
          error: null,
        });
      });
    } catch (error) {
      startTransition(() => {
        setState({
          session: null,
          user: null,
          isAdmin: false,
          isLoading: false,
          error: getNormalizedAdminAuthErrorMessage(error),
        });
      });
    }
  }, []);

  useEffect(() => {
    refreshSession();

    if (!supabase) {
      return undefined;
    }

    const { data } = supabase.auth.onAuthStateChange(() => {
      refreshSession();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const signIn = useCallback(
    async (email, password) => {
      if (!hasSupabaseBrowserConfig) {
        throw new Error(missingConfigMessage);
      }

      try {
        await signInWithPassword(email, password);
      } catch (error) {
        throw new Error(getNormalizedAdminAuthErrorMessage(error));
      }

      let adminState;
      try {
        adminState = await getCurrentAdminState();
      } catch (error) {
        throw new Error(getNormalizedAdminAuthErrorMessage(error));
      }

      if (!adminState.isAdmin) {
        await signOutAdmin();
        throw new Error('This account is not allowed to access the admin portal.');
      }

      startTransition(() => {
        setState({
          session: adminState.session,
          user: adminState.user,
          isAdmin: true,
          isLoading: false,
          error: null,
        });
      });

      return adminState;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutAdmin();

    startTransition(() => {
      setState({
        session: null,
        user: null,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      refreshSession,
    }),
    [refreshSession, signIn, signOut, state],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
