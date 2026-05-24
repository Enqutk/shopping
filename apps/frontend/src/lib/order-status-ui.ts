import type { OrderStatus } from '@shopping/shared';

export const ORDER_STATUS_BADGE: Record<
  OrderStatus,
  string
> = {
  PENDING: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
  AWAITING_CONFIRMATION: 'bg-violet-500/15 text-violet-200 border-violet-500/35',
  PAID: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35',
  SHIPPED: 'bg-sky-500/15 text-sky-200 border-sky-500/35',
  CANCELLED: 'bg-rose-500/15 text-rose-200 border-rose-500/35',
};
