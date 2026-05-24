import {
  asc,
  eq,
  orderStatusEvents,
  orders,
  type AppDatabase,
} from '@shopping/database';
import {
  buildOrderTimeline,
  STATUS_EVENT_MESSAGES,
  type OrderStatus,
  type OrderStatusEventDto,
} from '@shopping/shared';
const STATUS_FLOW: OrderStatus[] = [
  'PENDING',
  'AWAITING_CONFIRMATION',
  'PAID',
  'SHIPPED',
];

function statusesForOrder(status: OrderStatus): OrderStatus[] {
  if (status === 'CANCELLED') return ['PENDING', 'CANCELLED'];
  const idx = STATUS_FLOW.indexOf(status);
  return idx >= 0 ? STATUS_FLOW.slice(0, idx + 1) : ['PENDING'];
}

export async function appendOrderStatusEvent(
  db: AppDatabase,
  orderId: number,
  status: OrderStatus,
  message?: string,
) {
  await db.insert(orderStatusEvents).values({
    orderId,
    status,
    message: message ?? STATUS_EVENT_MESSAGES[status],
  });
}

export async function fetchOrderStatusEvents(
  db: AppDatabase,
  orderId: number,
): Promise<OrderStatusEventDto[]> {
  const rows = await db
    .select()
    .from(orderStatusEvents)
    .where(eq(orderStatusEvents.orderId, orderId))
    .orderBy(asc(orderStatusEvents.createdAt));

  return rows.map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    message: row.message,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
  }));
}

/** Ensures DB log has an entry for each step up to the order's current status. */
export async function syncEventsToCurrentStatus(
  db: AppDatabase,
  orderId: number,
  currentStatus: OrderStatus,
  orderCreatedAt: string | Date,
) {
  const events = await fetchOrderStatusEvents(db, orderId);
  const have = new Set(events.map((e) => e.status));
  const needed = statusesForOrder(currentStatus);
  let t = new Date(orderCreatedAt).getTime();

  for (const status of needed) {
    if (have.has(status)) {
      const existing = events.find((e) => e.status === status);
      if (existing) t = Math.max(t, new Date(existing.createdAt).getTime() + 60_000);
      continue;
    }
    await db.insert(orderStatusEvents).values({
      orderId,
      status,
      message: STATUS_EVENT_MESSAGES[status],
      createdAt: new Date(t),
    });
    t += 60_000;
  }
}

export async function attachTimelineToOrder<T extends {
  id: number;
  status: string;
  createdAt: string | Date;
}>(db: AppDatabase, order: T) {
  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt.toISOString()
      : String(order.createdAt);
  const status = order.status as OrderStatus;

  await syncEventsToCurrentStatus(db, order.id, status, createdAt);
  const events = await fetchOrderStatusEvents(db, order.id);
  const { steps, log } = buildOrderTimeline(status, events, createdAt);

  return {
    ...order,
    createdAt,
    timeline: steps,
    statusLog: log,
  };
}

export async function backfillOrderEventsFromOrders(db: AppDatabase) {
  const allOrders = await db.select().from(orders);
  for (const order of allOrders) {
    const createdAt =
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : String(order.createdAt);
    await syncEventsToCurrentStatus(
      db,
      order.id,
      order.status as OrderStatus,
      createdAt,
    );
  }
}
