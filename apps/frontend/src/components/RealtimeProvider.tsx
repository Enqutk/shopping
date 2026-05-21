'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useRealtimeStore } from '../store/realtime.store';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const connect = useRealtimeStore((s) => s.connect);
  const disconnect = useRealtimeStore((s) => s.disconnect);

  useEffect(() => {
    if (loading) return;
    if (user) {
      connect();
      return () => disconnect();
    }
    disconnect();
    return undefined;
  }, [user, loading, connect, disconnect]);

  return <>{children}</>;
}
