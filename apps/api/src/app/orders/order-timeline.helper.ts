import {
  orderStatusEvents,
  orders,
} from '@shopping/database';
import {
  buildOrderTimeline,
  STATUS_EVENT_MESSAGES,
  type OrderStatus,
  type OrderStatusEventDto,
} from '@shopping/shared';
import { asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

type Db = NodePgDatabase<any>;

export async function appendOrderStatusEvent(
  db: Db,
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
  db: Db,
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

export async function attachTimelineToOrder<T extends {
  id: number;
  status: string;
  createdAt: string;
}>(db: Db, order: T) {
  const events = await fetchOrderStatusEvents(db, order.id);
  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt.toISOString()
      : String(order.createdAt);
  const { steps, log } = buildOrderTimeline(
    order.status as OrderStatus,
    events,
    createdAt,
  );
  return {
    ...order,
    timeline: steps,
    statusLog: log,
  };
}

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED'];

export async function backfillOrderEventsFromOrders(db: Db) {
  const allOrders = await db.select().from(orders);
  for (const order of allOrders) {
    const existing = await fetchOrderStatusEvents(db, order.id);
    if (existing.length > 0) continue;

    const status = order.status as OrderStatus;
    const createdAt = order.createdAt ?? new Date();

    if (status === 'CANCELLED') {
      await db.insert(orderStatusEvents).values([
        {
          orderId: order.id,
          status: 'PENDING',
          message: STATUS_EVENT_MESSAGES.PENDING,
          createdAt,
        },
        {
          orderId: order.id,
          status: 'CANCELLED',
          message: STATUS_EVENT_MESSAGES.CANCELLED,
          createdAt,
        },
      ]);
      continue;
    }

    const idx = STATUS_FLOW.indexOf(status);
    const toInsert = STATUS_FLOW.slice(0, idx + 1).map((s) => ({
      orderId: order.id,
      status: s,
      message: STATUS_EVENT_MESSAGES[s],
      createdAt,
    }));

    if (toInsert.length > 0) {
      await db.insert(orderStatusEvents).values(toInsert);
    }
  }
}
