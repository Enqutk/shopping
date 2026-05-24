import type { OrderStatus } from '@shopping/shared';

const STEPS: OrderStatus[] = ['PENDING', 'AWAITING_CONFIRMATION', 'PAID', 'SHIPPED'];

function activeIndex(status: OrderStatus): number {
  const idx = STEPS.indexOf(status);
  if (idx >= 0) return idx;
  if (status === 'SHIPPED') return 3;
  return 0;
}

export default function OrderStatusProgress({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-400/90">
        Cancelled
      </span>
    );
  }

  const activeIdx = activeIndex(status);

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {STEPS.map((step, i) => (
        <span
          key={step}
          className={`h-1 w-4 sm:w-5 rounded-full transition-colors ${
            i <= activeIdx ? 'bg-femme-champagne' : 'bg-white/15'
          }`}
        />
      ))}
    </div>
  );
}
