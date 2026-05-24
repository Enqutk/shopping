import type { OrderStatusEventDto, OrderTimelineStep } from '../order-timeline.js';

export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_CONFIRMATION'
  | 'PAID'
  | 'SHIPPED'
  | 'CANCELLED';

/** Shown to customers after admin confirms payment */
export const ORDER_DELIVERY_ESTIMATE =
  'Your order will be prepared and delivered within 7–15 business days.';

export interface CheckoutItemInput {
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface OrderSummary {
  id: number;
  totalPrice: string;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export interface OrderItemLine {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  productName: string | null;
  productImageUrl: string | null;
  color?: string | null;
  size?: string | null;
}

/** e.g. "Champagne · M" for order line display */
export function formatOrderLineVariant(line: {
  color?: string | null;
  size?: string | null;
}): string | null {
  const parts: string[] = [];
  if (line.color?.trim()) parts.push(line.color.trim());
  if (line.size?.trim()) parts.push(line.size.trim());
  return parts.length > 0 ? parts.join(' · ') : null;
}

export interface OrderDetail {
  id: number;
  totalPrice: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemLine[];
  timeline?: OrderTimelineStep[];
  statusLog?: OrderStatusEventDto[];
}
