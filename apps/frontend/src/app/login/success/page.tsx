'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth.store';

/** AuthProvider reads OAuth tokens from the URL hash and loads the profile. */
export default function LoginSuccessPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/');
      return;
    }

    const retry = window.setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.user) {
        router.replace(state.user.role === 'ADMIN' ? '/admin' : '/');
      } else {
        router.replace('/login?error=Could+not+complete+Google+sign-in');
      }
    }, 800);

    return () => window.clearTimeout(retry);
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-femme-black text-arctic-deep">
      <p className="text-sm text-arctic-light animate-pulse">Completing Google sign-in…</p>
    </div>
  );
}
