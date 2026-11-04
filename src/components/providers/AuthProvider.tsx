'use client';

import React, { useEffect, useRef } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
}

// 15 minutes inactivity timeout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'ffh_last_activity_time';

function SessionInactivityTracker() {
  const { data: session, status } = useSession();
  const lastRecordedRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastRecordedRef.current = Date.now();

    // Only active when logged in
    if (status !== 'authenticated' || !session) {
      if (status === 'unauthenticated') {
        try {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        } catch {}
      }
      return;
    }

    const checkAndEnforceInactivity = (): boolean => {
      try {
        const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
        const now = Date.now();
        if (stored) {
          const elapsed = now - Number(stored);
          if (elapsed > INACTIVITY_TIMEOUT_MS) {
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            signOut({
              redirect: true,
              callbackUrl: '/login?reason=session_expired',
            });
            return true;
          }
        }
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {}
      return false;
    };

    // Check immediately upon mount / returning to site
    if (checkAndEnforceInactivity()) return;

    // Throttle user activity writes to localStorage (once per 15 seconds)
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecordedRef.current > 15000) {
        lastRecordedRef.current = now;
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        } catch {}
      }
    };

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        checkAndEnforceInactivity();
      }
    };

    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // Periodic check every 30 seconds
    const interval = setInterval(checkAndEnforceInactivity, 30000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      clearInterval(interval);
    };
  }, [status, session]);

  return null;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <SessionInactivityTracker />
      {children}
    </SessionProvider>
  );
}
