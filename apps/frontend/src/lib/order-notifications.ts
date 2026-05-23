import type { OrderStatus } from '@shopping/shared';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Order placed',
  PAID: 'Payment confirmed',
  SHIPPED: 'Order shipped',
  CANCELLED: 'Order cancelled',
};

export function orderStatusNotificationMessage(
  orderId: number,
  status: string,
): string {
  const label = STATUS_LABELS[status as OrderStatus];
  if (label) return `${label} — #${orderId}`;
  return `Order #${orderId} updated to ${status}`;
}
