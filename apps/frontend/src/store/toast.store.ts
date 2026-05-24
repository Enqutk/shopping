'use client';

import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  ts: number;
  href?: string;
}

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  href?: string;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, variant?: ToastVariant, href?: string) => void;
  notify: (options: ToastOptions) => void;
  success: (message: string, href?: string) => void;
  error: (message: string, href?: string) => void;
  info: (message: string, href?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const TOAST_AUTO_DISMISS_MS = 15000;

function scheduleAutoDismiss(id: string) {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    useToastStore.getState().dismiss(id);
  }, TOAST_AUTO_DISMISS_MS);
}

function addToast(
  items: ToastItem[],
  message: string,
  variant: ToastVariant,
  href?: string,
): ToastItem[] {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  scheduleAutoDismiss(id);
  return [{ id, message, variant, ts: Date.now(), href }, ...items].slice(0, 8);
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],

  push: (message, variant = 'default', href) =>
    set((s) => ({ items: addToast(s.items, message, variant, href) })),

  notify: ({ message, variant = 'default', href }) =>
    set((s) => ({ items: addToast(s.items, message, variant, href) })),

  success: (message, href) =>
    set((s) => ({ items: addToast(s.items, message, 'success', href) })),

  error: (message, href) =>
    set((s) => ({ items: addToast(s.items, message, 'error', href) })),

  info: (message, href) =>
    set((s) => ({ items: addToast(s.items, message, 'info', href) })),

  dismiss: (id) =>
    set((s) => ({ items: s.items.filter((t) => t.id !== id) })),

  dismissAll: () => set({ items: [] }),
}));

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
