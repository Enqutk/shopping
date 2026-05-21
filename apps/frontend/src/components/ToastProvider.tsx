'use client';

import { useToastStore, type ToastVariant } from '../store/toast.store';

const styles: Record<ToastVariant, string> = {
  default: 'border-neutral-200 bg-white text-luxe-ink',
  success: 'border-emerald-200/80 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200/80 bg-rose-50 text-rose-900',
  info: 'border-luxe-accent/30 bg-blue-50 text-blue-900',
};

export default function ToastProvider() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-2xl border shadow-luxe-lg px-5 py-4 text-sm flex justify-between gap-3 items-start animate-fade-up ${styles[t.variant]}`}
        >
          <p className="leading-snug font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="opacity-50 hover:opacity-100 shrink-0 text-lg leading-none"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
