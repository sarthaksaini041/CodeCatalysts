/* eslint-disable react-refresh/only-export-components */
import { createContext, startTransition, useContext, useEffect, useMemo, useState } from 'react';
import {
  getInitialPublicContentState,
  getPublicWebsiteContent,
} from '../services/publicContentService';
import { hasSupabaseBrowserConfig } from '../lib/supabase';

const PublicContentContext = createContext(getInitialPublicContentState());

export function PublicContentProvider({ children }) {
  const [state, setState] = useState(() => getInitialPublicContentState());

  useEffect(() => {
    if (!hasSupabaseBrowserConfig) {
      return undefined;
    }

    let isActive = true;

    async function loadContent() {
      const nextState = await getPublicWebsiteContent();

      if (!isActive) {
        return;
      }

      startTransition(() => {
        setState(nextState);
      });
    }

    loadContent();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return (
    <PublicContentContext.Provider value={value}>
      {children}
    </PublicContentContext.Provider>
  );
}

export function usePublicContent() {
  return useContext(PublicContentContext);
}
