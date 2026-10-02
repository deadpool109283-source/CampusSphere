import { useMemo, useState } from 'react';
import { SessionContext, STORAGE_KEY, previewProfiles } from './session';

function readPreviewSession() {
  if (!import.meta.env.DEV) return null;
  const saved = window.sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (parsed?.preview === true && previewProfiles[parsed.profile?.role]) {
      return parsed;
    }
  } catch (error) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    console.error('Unable to restore the CampusSphere preview session:', error);
  }
  return null;
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readPreviewSession);

  const value = useMemo(() => ({
    session,
    isLoading: false,
    startPreview(role) {
      if (!import.meta.env.DEV || !previewProfiles[role]) {
        throw new Error('Development preview is not available for this account.');
      }
      const nextSession = { preview: true, profile: previewProfiles[role] };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return nextSession;
    },
    endSession() {
      if (import.meta.env.DEV) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
      setSession(null);
    },
  }), [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
