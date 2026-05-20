'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useRealtimeStore } from '../store/realtime.store';

function ToastStack() {
  const notifications = useRealtimeStore((s) => s.notifications);
  const dismiss = useRealtimeStore((s) => s.dismiss);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.slice(0, 5).map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto rounded-xl border border-gray-200 bg-white shadow-lg px-4 py-3 text-sm text-gray-900 flex justify-between gap-3 items-start"
        >
          <p className="leading-snug">{n.message}</p>
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            className="text-gray-400 hover:text-gray-700 shrink-0 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

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

  return (
    <>
      {children}
      <ToastStack />
    </>
  );
}
