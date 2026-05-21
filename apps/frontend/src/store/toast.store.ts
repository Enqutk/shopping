'use client';

import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  ts: number;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

function addToast(
  items: ToastItem[],
  message: string,
  variant: ToastVariant,
): ToastItem[] {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return [{ id, message, variant, ts: Date.now() }, ...items].slice(0, 8);
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],

  push: (message, variant = 'default') =>
    set((s) => ({ items: addToast(s.items, message, variant) })),

  success: (message) =>
    set((s) => ({ items: addToast(s.items, message, 'success') })),

  error: (message) =>
    set((s) => ({ items: addToast(s.items, message, 'error') })),

  info: (message) =>
    set((s) => ({ items: addToast(s.items, message, 'info') })),

  dismiss: (id) =>
    set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
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
