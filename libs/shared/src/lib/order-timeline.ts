import type { OrderStatus } from './dto/order.js';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from './order-status.js';

export interface OrderStatusEventDto {
  id: number;
  status: OrderStatus;
  message: string;
  createdAt: string;
}

export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  state: TimelineStepState;
  at?: string;
  message?: string;
}

const FLOW: OrderStatus[] = ['PENDING', 'AWAITING_CONFIRMATION', 'PAID', 'SHIPPED'];

function optionDescription(status: OrderStatus): string {
  return ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.description ?? '';
}

export function buildOrderTimeline(
  currentStatus: OrderStatus,
  events: OrderStatusEventDto[],
  orderCreatedAt: string,
): { steps: OrderTimelineStep[]; log: OrderStatusEventDto[] } {
  const log =
    events.length > 0
      ? [...events].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      : synthesizeEvents(currentStatus, orderCreatedAt);

  const eventByStatus = new Map<OrderStatus, OrderStatusEventDto>();
  for (const e of log) {
    eventByStatus.set(e.status, e);
  }

  if (currentStatus === 'CANCELLED') {
    const ordered = eventByStatus.get('PENDING');
    const cancelled = eventByStatus.get('CANCELLED');
    return {
      log,
      steps: [
        {
          status: 'PENDING',
          label: getOrderStatusLabel('PENDING'),
          description: optionDescription('PENDING'),
          state: 'done',
          at: ordered?.createdAt ?? orderCreatedAt,
          message: ordered?.message,
        },
        {
          status: 'CANCELLED',
          label: getOrderStatusLabel('CANCELLED'),
          description: optionDescription('CANCELLED'),
          state: 'cancelled',
          at: cancelled?.createdAt,
          message: cancelled?.message,
        },
      ],
    };
  }

  const currentIdx = FLOW.indexOf(currentStatus);
  const steps: OrderTimelineStep[] = FLOW.map((status, idx) => {
    const ev = eventByStatus.get(status);
    let state: TimelineStepState = 'upcoming';
    if (idx < currentIdx) state = 'done';
    else if (idx === currentIdx) state = 'current';

    return {
      status,
      label: getOrderStatusLabel(status),
      description: optionDescription(status),
      state,
      at: ev?.createdAt ?? (status === 'PENDING' ? orderCreatedAt : undefined),
      message: ev?.message,
    };
  });

  return { steps, log };
}

function synthesizeEvents(
  currentStatus: OrderStatus,
  orderCreatedAt: string,
): OrderStatusEventDto[] {
  const synthetic: OrderStatusEventDto[] = [
    {
      id: 0,
      status: 'PENDING',
      message: 'Order placed',
      createdAt: orderCreatedAt,
    },
  ];

  if (currentStatus === 'PAID' || currentStatus === 'SHIPPED') {
    synthetic.push({
      id: 0,
      status: 'PAID',
      message: 'Payment confirmed',
      createdAt: orderCreatedAt,
    });
  }
  if (currentStatus === 'SHIPPED') {
    synthetic.push({
      id: 0,
      status: 'SHIPPED',
      message: 'Order delivered',
      createdAt: orderCreatedAt,
    });
  }
  if (currentStatus === 'CANCELLED') {
    synthetic.push({
      id: 0,
      status: 'CANCELLED',
      message: 'Order cancelled',
      createdAt: orderCreatedAt,
    });
  }

  return synthetic;
}

export const STATUS_EVENT_MESSAGES: Record<OrderStatus, string> = {
  PENDING: 'Order placed',
  AWAITING_CONFIRMATION: 'Payment submitted — awaiting confirmation',
  PAID: 'Payment confirmed — delivery in 7–15 days',
  SHIPPED: 'Order delivered',
  CANCELLED: 'Order cancelled',
};
