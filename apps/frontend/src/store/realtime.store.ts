'use client';

import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useAuthStore } from './auth.store';
import { useToastStore } from './toast.store';

let socket: Socket | null = null;

function realtimeBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_REALTIME_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const stripped = api.replace(/\/api\/?$/i, '');
  return stripped || 'http://localhost:3000';
}

interface RealtimeState {
  connected: boolean;
  orderStatusById: Record<number, string>;
  connect: () => void;
  disconnect: () => void;
}

function pushToast(message: string, variant: 'success' | 'info' = 'info') {
  const store = useToastStore.getState();
  if (variant === 'success') store.success(message);
  else store.info(message);
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  orderStatusById: {},

  connect: () => {
    if (typeof window === 'undefined') return;
    if (socket?.connected) return;

    const url = realtimeBaseUrl();
    socket = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on(
      'order:created',
      (payload: { order?: { id: number }; userId?: number; scope?: string }) => {
        if (payload?.scope === 'self') {
          const oid = payload?.order?.id;
          pushToast(oid != null ? `Order #${oid} confirmed` : 'Order placed', 'success');
          return;
        }
        if (payload?.scope === 'admin') {
          const me = useAuthStore.getState().user?.id;
          if (me != null && payload.userId === me) return;
        }
        const oid = payload?.order?.id;
        pushToast(oid != null ? `New order #${oid}` : 'New order placed');
      },
    );

    socket.on('order:status', (payload: { orderId: number; status: string }) => {
      set((s) => ({
        orderStatusById: { ...s.orderStatusById, [payload.orderId]: payload.status },
      }));
      pushToast(`Order #${payload.orderId} → ${payload.status}`);
    });

    socket.on('admin:notification', (body: { message?: string }) => {
      if (body?.message) pushToast(body.message);
    });
  },

  disconnect: () => {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
    set({ connected: false });
  },

}));
