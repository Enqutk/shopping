import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, orderItems, orders, products, users } from '@shopping/database';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CheckoutDto, CheckoutLineDto } from './checkout.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  appendOrderStatusEvent,
  attachTimelineToOrder,
} from './order-timeline.helper';
import { getOrderStatusLabel, STATUS_EVENT_MESSAGES } from '@shopping/shared';

type MergedLine = {
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
};

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
    private readonly realtime: RealtimeGateway,
  ) {}

  private mergeLines(items: CheckoutLineDto[]): MergedLine[] {
    const map = new Map<string, MergedLine>();
    for (const row of items) {
      const color = row.color?.trim() || undefined;
      const size = row.size?.trim() || undefined;
      const key = `${row.productId}|${color ?? ''}|${size ?? ''}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += row.quantity;
      } else {
        map.set(key, {
          productId: row.productId,
          quantity: row.quantity,
          color,
          size,
        });
      }
    }
    return [...map.values()];
  }

  async checkout(userId: number, dto: CheckoutDto) {
    const lines = this.mergeLines(dto.items);
    const ids = [...new Set(lines.map((l) => l.productId))];

    const productRows = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, ids));

    if (productRows.length !== ids.length) {
      throw new BadRequestException('One or more products were not found');
    }

    const productById = new Map(productRows.map((p) => [p.id, p]));

    let total = 0;
    for (const line of lines) {
      const p = productById.get(line.productId)!;
      if (line.quantity > p.stock) {
        throw new BadRequestException(
          `Insufficient stock for "${p.name}" (${p.stock} available)`,
        );
      }
      total += Number(p.price) * line.quantity;
    }

    const totalPriceStr = total.toFixed(2);

    const result = await this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          userId,
          totalPrice: totalPriceStr,
          status: 'PENDING',
        })
        .returning();

      const order = inserted[0];
      if (!order) {
        throw new BadRequestException('Failed to create order');
      }

      await tx.insert(orderItems).values(
        lines.map((line) => {
          const p = productById.get(line.productId)!;
          return {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            price: String(p.price),
            color: line.color ?? null,
            size: line.size ?? null,
          };
        }),
      );

      for (const line of lines) {
        const p = productById.get(line.productId)!;
        await tx
          .update(products)
          .set({ stock: p.stock - line.quantity })
          .where(eq(products.id, line.productId));
      }

      await appendOrderStatusEvent(
        tx,
        order.id,
        'PENDING',
        STATUS_EVENT_MESSAGES.PENDING,
      );

      return this.findOneForUser(userId, order.id, tx);
    });

    this.realtime.emitOrderCreated(userId, result);

    const customer = await this.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const c = customer[0];
    this.realtime.emitAdminActivity({
      type: 'order.placed',
      message: `New order #${result.id} — ${c?.name ?? 'Customer'} · $${Number(result.totalPrice).toFixed(2)}`,
      href: `/admin/orders/${result.id}`,
      meta: {
        orderId: result.id,
        userId,
        userName: c?.name ?? undefined,
        userEmail: c?.email ?? undefined,
      },
    });

    return result;
  }

  async findManyForUser(userId: number) {
    const rows = await this.db
      .select({
        id: orders.id,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
        itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(eq(orders.userId, userId))
      .groupBy(
        orders.id,
        orders.totalPrice,
        orders.status,
        orders.createdAt,
      )
      .orderBy(desc(orders.createdAt));

    return {
      data: rows.map((r) => ({
        id: r.id,
        totalPrice: String(r.totalPrice),
        status: r.status,
        createdAt:
          r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
        itemCount: r.itemCount,
      })),
    };
  }

  async findOneForUser(
    userId: number,
    orderId: number,
    tx?: NodePgDatabase<any>,
  ) {
    const db = tx ?? this.db;

    const orderRow = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    const order = orderRow[0];
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    const itemRows = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        color: orderItems.color,
        size: orderItems.size,
        productName: products.name,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, orderId));

    const base = {
      id: order.id,
      totalPrice: String(order.totalPrice),
      status: order.status,
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : String(order.createdAt),
      items: itemRows.map((row) => ({
        id: row.id,
        productId: row.productId,
        quantity: row.quantity,
        price: String(row.price),
        color: row.color ?? null,
        size: row.size ?? null,
        productName: row.productName,
        productImageUrl: row.productImageUrl,
      })),
    };

    return attachTimelineToOrder(db, base);
  }

  async findOneByIdForAdmin(orderId: number) {
    const orderRow = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = orderRow[0];
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }

  async payByCustomer(userId: number, orderId: number) {
    const existing = await this.findOneByIdForAdmin(orderId);
    if (existing.userId !== userId) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    if (existing.status === 'AWAITING_CONFIRMATION') {
      throw new BadRequestException(
        'Payment already submitted — waiting for confirmation',
      );
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        existing.status === 'PAID' || existing.status === 'SHIPPED'
          ? 'This order is already paid'
          : 'This order can no longer be paid online',
      );
    }

    await this.db
      .update(orders)
      .set({ status: 'AWAITING_CONFIRMATION' })
      .where(eq(orders.id, orderId));
    await appendOrderStatusEvent(
      this.db,
      orderId,
      'AWAITING_CONFIRMATION',
      STATUS_EVENT_MESSAGES.AWAITING_CONFIRMATION,
    );

    const customer = await this.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const c = customer[0];
    this.realtime.emitAdminActivity({
      type: 'order.payment_submitted',
      message: `Payment to confirm — Order #${orderId} · ${c?.name ?? 'Customer'} · $${Number(existing.totalPrice).toFixed(2)}`,
      href: `/admin/orders/${orderId}`,
      meta: {
        orderId,
        userId,
        userName: c?.name ?? undefined,
        userEmail: c?.email ?? undefined,
        status: 'AWAITING_CONFIRMATION',
      },
    });

    return this.findOneForUser(userId, orderId);
  }

  async confirmPaymentByAdmin(orderId: number) {
    const existing = await this.findOneByIdForAdmin(orderId);
    if (existing.status !== 'AWAITING_CONFIRMATION') {
      throw new BadRequestException(
        existing.status === 'PAID' || existing.status === 'SHIPPED'
          ? 'Payment is already confirmed'
          : 'This order is not awaiting payment confirmation',
      );
    }

    const paidMessage = STATUS_EVENT_MESSAGES.PAID;
    await this.db.update(orders).set({ status: 'PAID' }).where(eq(orders.id, orderId));
    await appendOrderStatusEvent(this.db, orderId, 'PAID', paidMessage);
    this.realtime.emitOrderStatus(existing.userId, { orderId, status: 'PAID' });

    const customer = await this.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, existing.userId))
      .limit(1);
    const c = customer[0];
    this.realtime.emitAdminActivity({
      type: 'order.status_updated',
      message: `Payment confirmed — Order #${orderId} · ${c?.name ?? 'Customer'}`,
      href: `/admin/orders/${orderId}`,
      meta: {
        orderId,
        userId: existing.userId,
        userName: c?.name ?? undefined,
        userEmail: c?.email ?? undefined,
        status: 'PAID',
      },
    });

    return this.findOneForUser(existing.userId, orderId);
  }

  async updateStatusByAdmin(
    orderId: number,
    status:
      | 'PENDING'
      | 'AWAITING_CONFIRMATION'
      | 'PAID'
      | 'SHIPPED'
      | 'CANCELLED',
  ) {
    const existing = await this.findOneByIdForAdmin(orderId);
    if (existing.status !== status) {
      await this.db.update(orders).set({ status }).where(eq(orders.id, orderId));
      await appendOrderStatusEvent(
        this.db,
        orderId,
        status,
        STATUS_EVENT_MESSAGES[status],
      );
      this.realtime.emitOrderStatus(existing.userId, { orderId, status });

      const customer = await this.db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, existing.userId))
        .limit(1);
      const c = customer[0];
      this.realtime.emitAdminActivity({
        type: 'order.status_updated',
        message: `Order #${orderId} → ${getOrderStatusLabel(status)} (${c?.name ?? 'customer'})`,
        href: `/admin/orders/${orderId}`,
        meta: {
          orderId,
          userId: existing.userId,
          userName: c?.name ?? undefined,
          userEmail: c?.email ?? undefined,
          status,
        },
      });
    }
    return { orderId, status, userId: existing.userId };
  }

  async findRecentForAdmin() {
    const rows = await this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
        itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .groupBy(orders.id, orders.userId, orders.totalPrice, orders.status, orders.createdAt)
      .orderBy(desc(orders.createdAt))
      .limit(50);

    return {
      data: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        totalPrice: String(r.totalPrice),
        status: r.status,
        createdAt:
          r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
        itemCount: r.itemCount,
      })),
    };
  }
}
