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
          error: error.message || 'Unable to verify the admin session.',
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

      await signInWithPassword(email, password);
      const adminState = await getCurrentAdminState();

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
