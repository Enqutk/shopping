import type { OrderStatus } from './dto/order.js';

export interface OrderStatusOption {
  value: OrderStatus;
  label: string;
  description: string;
}

/** Storefront + admin display labels (DB values stay PENDING, PAID, etc.) */
export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  {
    value: 'PENDING',
    label: 'Ordered',
    description: 'Customer placed the order',
  },
  {
    value: 'AWAITING_CONFIRMATION',
    label: 'Verifying payment',
    description: 'Customer paid — awaiting store confirmation',
  },
  {
    value: 'PAID',
    label: 'Paid',
    description: 'Payment confirmed — ready to fulfill',
  },
  {
    value: 'SHIPPED',
    label: 'Delivered',
    description: 'Order delivered to customer',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    description: 'Order was cancelled',
  },
];

export function getOrderStatusLabel(status: string): string {
  const found = ORDER_STATUS_OPTIONS.find((o) => o.value === status);
  return found?.label ?? status;
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_OPTIONS.some((o) => o.value === value);
}
