'use client';

import { useRouter } from 'next/navigation';
import { useToastStore, type ToastItem, type ToastVariant } from '../store/toast.store';

const styles: Record<ToastVariant, string> = {
  default:
    'border-white/15 bg-femme-surface/95 text-arctic-deep backdrop-blur-md shadow-arctic',
  success:
    'border-femme-champagne/40 bg-femme-surface/95 text-arctic-deep backdrop-blur-md shadow-[0_8px_32px_rgba(201,169,98,0.12)]',
  error:
    'border-rose-500/35 bg-femme-surface/95 text-rose-100 backdrop-blur-md shadow-arctic',
  info:
    'border-femme-champagne/25 bg-femme-surface/95 text-arctic-deep backdrop-blur-md shadow-arctic',
};

const accentBar: Record<ToastVariant, string> = {
  default: 'bg-white/30',
  success: 'bg-femme-champagne',
  error: 'bg-rose-400',
  info: 'bg-femme-champagne/70',
};

export default function ToastProvider() {
  const router = useRouter();
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  const dismissAll = useToastStore((s) => s.dismissAll);
  const showClearAll = items.length > 2;

  const goTo = (toast: ToastItem) => {
    if (!toast.href) return;
    dismiss(toast.id);
    router.push(toast.href);
  };

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {showClearAll && (
        <button
          type="button"
          onClick={dismissAll}
          className="pointer-events-auto self-end text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne hover:text-femme-champagne-light bg-femme-black/90 backdrop-blur border border-femme-champagne/30 rounded-full px-4 py-2 shadow-arctic transition-colors"
        >
          Clear all
        </button>
      )}
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto relative overflow-hidden rounded-arctic border pl-4 pr-4 py-4 text-sm flex justify-between gap-3 items-start animate-fade-up ${styles[t.variant]}`}
        >
          <span
            className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar[t.variant]}`}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => goTo(t)}
            disabled={!t.href}
            className={`flex-1 min-w-0 text-left pl-2 ${
              t.href ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
            }`}
          >
            <p className="leading-snug font-medium normal-case tracking-normal">{t.message}</p>
            {t.href && (
              <p className="text-[10px] uppercase tracking-wider text-femme-champagne mt-1.5 font-bold">
                Tap to view →
              </p>
            )}
          </button>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="text-arctic-light hover:text-femme-champagne shrink-0 text-lg leading-none transition-colors"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
