'use client';

import type { OrderStatusEventDto, OrderTimelineStep } from '@shopping/shared';

interface OrderTimelineProps {
  steps: OrderTimelineStep[];
  log?: OrderStatusEventDto[];
  variant?: 'dark' | 'light';
}

function formatWhen(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderTimeline({
  steps,
  log = [],
  variant = 'dark',
}: OrderTimelineProps) {
  const isDark = variant === 'dark';

  return (
    <div className="space-y-8">
      <div>
        <h2
          className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-5 ${
            isDark ? 'text-arctic-light' : 'text-gray-500'
          }`}
        >
          Order progress
        </h2>
        <ol className="relative space-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const dotClass =
              step.state === 'done'
                ? 'bg-femme-champagne border-femme-champagne'
                : step.state === 'current'
                  ? 'bg-femme-champagne/20 border-femme-champagne ring-2 ring-femme-champagne/40'
                  : step.state === 'cancelled'
                    ? 'bg-rose-500/20 border-rose-400'
                    : isDark
                      ? 'bg-transparent border-white/20'
                      : 'bg-transparent border-gray-300';

            const lineClass =
              step.state === 'done' || step.state === 'current'
                ? 'bg-femme-champagne/50'
                : isDark
                  ? 'bg-white/10'
                  : 'bg-gray-200';

            return (
              <li key={`${step.status}-${index}`} className="relative flex gap-4 pb-8">
                {!isLast && (
                  <span
                    className={`absolute left-[11px] top-6 bottom-0 w-px ${lineClass}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${dotClass}`}
                  aria-hidden
                />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p
                      className={`text-sm font-semibold uppercase tracking-wide ${
                        step.state === 'upcoming'
                          ? isDark
                            ? 'text-arctic-light/50'
                            : 'text-gray-400'
                          : step.state === 'cancelled'
                            ? 'text-rose-300'
                            : isDark
                              ? 'text-arctic-deep'
                              : 'text-gray-900'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.at && (
                      <time
                        className={`text-[11px] tabular-nums ${
                          isDark ? 'text-arctic-light/70' : 'text-gray-500'
                        }`}
                        dateTime={step.at}
                      >
                        {formatWhen(step.at)}
                      </time>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 normal-case tracking-normal ${
                      isDark ? 'text-arctic-light/80' : 'text-gray-500'
                    }`}
                  >
                    {step.message ?? step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {log.length > 0 && (
        <div>
          <h2
            className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${
              isDark ? 'text-arctic-light' : 'text-gray-500'
            }`}
          >
            Activity log
          </h2>
          <ul
            className={`rounded-lg border divide-y ${
              isDark
                ? 'border-white/10 divide-white/10 bg-black/20'
                : 'border-gray-200 divide-gray-100 bg-gray-50'
            }`}
          >
            {log.map((entry) => (
              <li
                key={`${entry.id}-${entry.status}-${entry.createdAt}`}
                className="flex justify-between gap-3 px-3 py-2.5 text-xs"
              >
                <span className={isDark ? 'text-arctic-deep' : 'text-gray-800'}>
                  {entry.message}
                </span>
                <time
                  className={`shrink-0 tabular-nums ${
                    isDark ? 'text-arctic-light/60' : 'text-gray-500'
                  }`}
                  dateTime={entry.createdAt}
                >
                  {formatWhen(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
