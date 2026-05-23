'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { apiFetch } from '../lib/api-client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        const res = await apiFetch('/auth/me', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
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
