'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/auth.store';
import { syncCartToUser } from '../../../store/cart.store';
import { apiFetch } from '../../../lib/api-client';

export default function LoginSuccessPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const res = await apiFetch('/auth/me', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const user = await res.json();
          setUser(user);
          syncCartToUser(user.id);
          router.push('/');
        } else {
          router.push('/login');
        }
      } catch {
        if (!cancelled) router.push('/login');
      }
    }

    fetchProfile();
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
