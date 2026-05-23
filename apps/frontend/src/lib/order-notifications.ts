import { getOrderStatusLabel } from '@shopping/shared';

export function orderStatusNotificationMessage(
  orderId: number,
  status: string,
): string {
  const label = getOrderStatusLabel(status);
  return `Order #${orderId} — ${label}`;
}
