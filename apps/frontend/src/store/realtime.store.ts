'use client';

import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useAuthStore } from './auth.store';

let socket: Socket | null = null;

function realtimeBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_REALTIME_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const stripped = api.replace(/\/api\/?$/i, '');
  return stripped || 'http://localhost:3000';
}

export interface ToastItem {
  id: string;
  message: string;
  ts: number;
}

interface RealtimeState {
  connected: boolean;
  notifications: ToastItem[];
  orderStatusById: Record<number, string>;
  connect: () => void;
  disconnect: () => void;
  dismiss: (id: string) => void;
}

function pushToast(set: (fn: (s: RealtimeState) => Partial<RealtimeState>) => void, message: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  set((s) => ({
    notifications: [{ id, message, ts: Date.now() }, ...s.notifications].slice(0, 25),
  }));
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  notifications: [],
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
          pushToast(set, oid != null ? `Order #${oid} confirmed` : 'Order placed');
          return;
        }
        if (payload?.scope === 'admin') {
          const me = useAuthStore.getState().user?.id;
          if (me != null && payload.userId === me) return;
        }
        const oid = payload?.order?.id;
        pushToast(set, oid != null ? `New order #${oid}` : 'New order placed');
      },
    );

    socket.on('order:status', (payload: { orderId: number; status: string }) => {
      set((s) => ({
        orderStatusById: { ...s.orderStatusById, [payload.orderId]: payload.status },
      }));
      pushToast(set, `Order #${payload.orderId} → ${payload.status}`);
    });

    socket.on('admin:notification', (body: { message?: string }) => {
      if (body?.message) pushToast(set, body.message);
    });
  },

  disconnect: () => {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
    set({ connected: false });
  },

  dismiss: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));
