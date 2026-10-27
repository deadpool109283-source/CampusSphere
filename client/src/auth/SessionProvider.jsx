import { useEffect, useMemo, useState } from 'react';
import { SessionContext, STORAGE_KEY, previewProfiles } from './session';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { rawFetch } from '../lib/api';

const VALID_ROLES = ['STUDENT', 'CLUB_COMMITTEE', 'CLUB_EXECUTIVE', 'CLUB_PRESIDENT', 'FACULTY', 'ADMIN', 'ICTS'];

function readPreviewSession() {
  const saved = window.sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (parsed?.profile && VALID_ROLES.includes(parsed.profile.role)) {
      return parsed;
    }
    // Discard tampered session
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    console.error('Unable to restore the Amrita Sangam preview session:', error);
  }
  return null;
}

function mapBackendProfile(profile) {
  if (!profile) return null;
  let role = 'STUDENT';
  if (profile.role === 'icts') {
    role = 'ICTS';
  } else if (profile.role === 'college_admin') {
    role = 'ADMIN';
  } else if (profile.role === 'faculty_coordinator') {
    role = 'FACULTY';
  } else if (profile.role === 'club_committee') {
    role = 'CLUB_COMMITTEE';
  } else {
    role = 'STUDENT';
  }

  return {
    id: String(profile._id || profile.id || ''),
    fullName: profile.name || profile.fullName || 'Campus Member',
    email: profile.email || '',
    rollNumber: profile.registerNumber || profile.rollNumber || '',
    branch: profile.department || '',
    role,
    backendRole: profile.role,
    adminType: profile.adminType,
    clubIds: profile.clubIds || [],
    clubNames: profile.clubNames || [],
    memberships: profile.memberships || [],
    verifiedClubId: profile.verifiedClubId,
    verifiedClubName: profile.verifiedClubName || profile.clubName,
    isClubAccount: Boolean(profile.isClubAccount),
    raw: profile,
  };
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readPreviewSession);
  const [isLoading, setIsLoading] = useState(supabaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data?.session) {
          try {
            const profile = await rawFetch('/profiles/me');
            if (active) {
              const mapped = {
                authenticated: true,
                supabaseSession: data.session,
                profile: mapBackendProfile(profile),
              };
              setSession(mapped);
            }
          } catch (profileErr) {
            console.warn('Could not load profile from backend:', profileErr);
            if (active) {
              setSession({
                authenticated: true,
                supabaseSession: data.session,
                profile: {
                  id: data.session.user.id,
                  fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
                  email: data.session.user.email,
                  role: 'STUDENT',
                },
              });
            }
          }
        }
      } catch (err) {
        if (active) setAuthError(err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!active) return;
      if (nextSession) {
        try {
          const profile = await rawFetch('/profiles/me');
          if (active) {
            setSession({
              authenticated: true,
              supabaseSession: nextSession,
              profile: mapBackendProfile(profile),
            });
          }
        } catch {
          if (active) {
            setSession({
              authenticated: true,
              supabaseSession: nextSession,
              profile: {
                id: nextSession.user.id,
                fullName: nextSession.user.user_metadata?.full_name || nextSession.user.email?.split('@')[0] || 'User',
                email: nextSession.user.email,
                role: 'STUDENT',
              },
            });
          }
        }
      } else {
        if (active && !window.sessionStorage.getItem(STORAGE_KEY)) {
          setSession(null);
        }
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    isLoading,
    authError,
    supabaseConfigured,
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase authentication is not configured in client/.env');
      setIsLoading(true);
      setAuthError('');
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Also attempt backend login to establish backend session cookie
        try {
          await rawFetch('/auth/login', {
            method: 'POST',
            body: { email, password },
          });
        } catch (backendCookieErr) {
          console.warn('Backend session cookie note:', backendCookieErr);
        }

        let profile = null;
        try {
          profile = await rawFetch('/profiles/me');
        } catch (profileErr) {
          console.warn('Could not load profile from backend, using authenticated user identity:', profileErr);
        }

        const nextSession = {
          authenticated: true,
          supabaseSession: data.session,
          profile: profile ? mapBackendProfile(profile) : {
            id: data.session.user.id,
            fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email,
            role: 'STUDENT',
          },
        };
        setSession(nextSession);
        return nextSession;
      } catch (error) {
        setAuthError(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    async signOut() {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
      window.sessionStorage.removeItem(STORAGE_KEY);
      setSession(null);
    },
    async resetPassword(email) {
      if (!supabase) throw new Error('Authentication is not configured in client/.env');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return true;
    },
    startPreview(role) {
      if (!previewProfiles[role]) {
        throw new Error('Preview is not available for this role.');
      }
      const nextSession = { preview: true, profile: previewProfiles[role] };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return nextSession;
    },
    endSession() {
      if (supabase && session?.authenticated) {
        supabase.auth.signOut().catch(() => {});
      }
      window.sessionStorage.removeItem(STORAGE_KEY);
      setSession(null);
    },
    async reloadProfile() {
      try {
        const profile = await rawFetch('/profiles/me');
        if (profile) {
          setSession((prev) => ({
            ...prev,
            profile: mapBackendProfile(profile),
          }));
        }
      } catch (err) {
        console.warn('Failed to reload profile:', err);
      }
    },
  }), [session, isLoading, authError]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
