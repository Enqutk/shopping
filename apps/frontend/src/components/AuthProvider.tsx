'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { syncCartToUser } from '../store/cart.store';
import { apiFetch, ensureValidSession } from '../lib/api-client';
import { clearSessionTokens, consumeOAuthTokensFromUrl } from '../lib/session-auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        consumeOAuthTokensFromUrl();
        const hasSession = await ensureValidSession();
        if (!hasSession) {
          if (!cancelled) {
            setUser(null);
            syncCartToUser(null);
          }
          return;
        }

        const res = await apiFetch('/auth/me');
        if (cancelled) return;
        if (res.ok) {
          const user = await res.json();
          if (!cancelled) {
            setUser(user);
            syncCartToUser(user.id);
          }
        } else if (!cancelled) {
          clearSessionTokens();
          setUser(null);
          syncCartToUser(null);
        }
      } catch {
        if (!cancelled) {
          clearSessionTokens();
          setUser(null);
          syncCartToUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
