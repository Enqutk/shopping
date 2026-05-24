import { getOrderStatusLabel, ORDER_DELIVERY_ESTIMATE } from '@shopping/shared';

export function orderStatusNotificationMessage(
  orderId: number,
  status: string,
): string {
  if (status === 'PAID') {
    return `Order #${orderId} — Payment confirmed! ${ORDER_DELIVERY_ESTIMATE}`;
  }
  if (status === 'AWAITING_CONFIRMATION') {
    return `Order #${orderId} — Payment submitted, awaiting confirmation`;
  }
  const label = getOrderStatusLabel(status);
  return `Order #${orderId} — ${label}`;
}
