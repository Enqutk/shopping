'use client';

import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { orderStatusNotificationMessage } from '../lib/order-notifications';
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

type AdminActivityPayload = {
  type: string;
  message: string;
  href?: string;
  at?: string;
};

export type AdminActivityItem = AdminActivityPayload & { id: string };

interface RealtimeState {
  connected: boolean;
  orderStatusById: Record<number, string>;
  adminActivities: AdminActivityItem[];
  connect: () => void;
  disconnect: () => void;
  clearAdminActivities: () => void;
  hydrateAdminActivities: (items: AdminActivityItem[]) => void;
}

function pushToast(
  message: string,
  variant: 'success' | 'info' = 'info',
  href?: string,
) {
  const store = useToastStore.getState();
  if (variant === 'success') store.success(message, href);
  else store.info(message, href);
}

function notifyAdminActivity(body: AdminActivityPayload) {
  const user = useAuthStore.getState().user;
  if (user?.role !== 'ADMIN' || !body.message) return;

  const item: AdminActivityItem = {
    ...body,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: body.at ?? new Date().toISOString(),
  };
  useRealtimeStore.setState((s) => ({
    adminActivities: [item, ...s.adminActivities].slice(0, 30),
  }));

  pushToast(body.message, 'info', body.href);
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  orderStatusById: {},
  adminActivities: [],

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
      (payload: { order?: { id: number }; scope?: string }) => {
        if (payload?.scope !== 'self') return;
        const oid = payload?.order?.id;
        pushToast(
          oid != null ? `Order #${oid} placed successfully` : 'Order placed',
          'success',
          oid != null ? `/orders/${oid}` : '/orders',
        );
      },
    );

    socket.on('order:status', (payload: { orderId: number; status: string }) => {
      const user = useAuthStore.getState().user;
      if (user?.role === 'ADMIN') return;

      set((s) => ({
        orderStatusById: { ...s.orderStatusById, [payload.orderId]: payload.status },
      }));
      const message = orderStatusNotificationMessage(payload.orderId, payload.status);
      pushToast(message, 'success', `/orders/${payload.orderId}`);
    });

    socket.on('admin:activity', (body: AdminActivityPayload) => {
      notifyAdminActivity(body);
    });

    socket.on('admin:notification', (body: { message?: string; href?: string }) => {
      if (body?.message) {
        notifyAdminActivity({ type: 'broadcast', message: body.message, href: body.href });
      }
    });
  },

  disconnect: () => {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
    set({ connected: false });
  },

  clearAdminActivities: () => set({ adminActivities: [] }),

  hydrateAdminActivities: (items) =>
    set((s) => {
      const seen = new Set(s.adminActivities.map((a) => a.id));
      const merged = [...items.filter((i) => !seen.has(i.id)), ...s.adminActivities];
      merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      return { adminActivities: merged.slice(0, 50) };
    }),
}));
