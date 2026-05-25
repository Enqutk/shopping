'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth.store';
import { syncCartToUser } from '../../../store/cart.store';
import { apiFetch } from '../../../lib/api-client';
import { setSessionTokens } from '../../../lib/session-auth';

function readOAuthTokensFromHash(): { access: string; refresh: string } | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const access = params.get('access_token');
  const refresh = params.get('refresh_token');
  if (!access || !refresh) return null;
  return { access, refresh };
}

export default function LoginSuccessPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      const fromHash = readOAuthTokensFromHash();
      if (fromHash) {
        setSessionTokens(fromHash.access, fromHash.refresh);
        window.history.replaceState(null, '', window.location.pathname);
      }

      try {
        const res = await apiFetch('/auth/me');
        if (cancelled) return;
        if (res.ok) {
          const user = await res.json();
          setUser(user);
          syncCartToUser(user.id);
          router.push(user.role === 'ADMIN' ? '/admin' : '/');
        } else {
          router.push('/login');
        }
      } catch {
        if (!cancelled) router.push('/login');
      }
    }

    completeLogin();
    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Completing login...</p>
    </div>
  );
}
