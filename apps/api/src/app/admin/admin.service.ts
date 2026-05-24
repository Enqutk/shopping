import { Injectable, Inject } from '@nestjs/common';
import {
  DATABASE_CONNECTION,
  orderItems,
  orderStatusEvents,
  orders,
  products,
  users,
} from '@shopping/database';
import type { AdminActivityDto } from '@shopping/shared';
import { getOrderStatusLabel } from '@shopping/shared';
import { attachTimelineToOrder } from '../orders/order-timeline.helper';
import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async getStats() {
    const [
      productCount,
      orderCount,
      revenueRow,
      customerRow,
      lowStockRow,
      statusRows,
      revenueByDayRows,
      recentRows,
    ] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)::int` }).from(products),
      this.db.select({ count: sql<number>`count(*)::int` }).from(orders),
      this.db.select({
        total: sql<string>`coalesce(sum(${orders.totalPrice}), 0)`,
      }).from(orders),
      this.db.select({
        count: sql<number>`count(distinct ${orders.userId})::int`,
      }).from(orders),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(lte(products.stock, 5)),
      this.db
        .select({
          status: orders.status,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .groupBy(orders.status),
      this.db
        .select({
          date: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
          revenue: sql<string>`coalesce(sum(${orders.totalPrice}), 0)`,
        })
        .from(orders)
        .where(gte(orders.createdAt, sql`now() - interval '7 days'`))
        .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
        .orderBy(sql`date_trunc('day', ${orders.createdAt})`),
      this.db
        .select({
          id: orders.id,
          userId: orders.userId,
          userName: users.name,
          userEmail: users.email,
          totalPrice: orders.totalPrice,
          status: orders.status,
          createdAt: orders.createdAt,
          itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .leftJoin(users, eq(users.id, orders.userId))
        .groupBy(
          orders.id,
          orders.userId,
          users.name,
          users.email,
          orders.totalPrice,
          orders.status,
          orders.createdAt,
        )
        .orderBy(desc(orders.createdAt))
        .limit(8),
    ]);

    const ordersByStatus = {
      PENDING: 0,
      AWAITING_CONFIRMATION: 0,
      PAID: 0,
      SHIPPED: 0,
      CANCELLED: 0,
    } as Record<string, number>;
    for (const row of statusRows) {
      ordersByStatus[row.status] = row.count;
    }

    return {
      totals: {
        products: productCount[0]?.count ?? 0,
        orders: orderCount[0]?.count ?? 0,
        revenue: String(revenueRow[0]?.total ?? '0'),
        customers: customerRow[0]?.count ?? 0,
        lowStock: lowStockRow[0]?.count ?? 0,
      },
      ordersByStatus,
      revenueByDay: revenueByDayRows.map((r) => ({
        date: r.date,
        revenue: String(r.revenue),
      })),
      recentOrders: recentRows.map((r) => this.mapOrderRow(r)),
    };
  }

  async findOrders(query: AdminOrdersQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 15));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(
        eq(
          orders.status,
          query.status as
            | 'PENDING'
            | 'AWAITING_CONFIRMATION'
            | 'PAID'
            | 'SHIPPED'
            | 'CANCELLED',
        ),
      );
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      const idNum = parseInt(query.search.trim(), 10);
      if (!Number.isNaN(idNum)) {
        conditions.push(
          or(eq(orders.id, idNum), ilike(users.email, term), ilike(users.name, term))!,
        );
      } else {
        conditions.push(or(ilike(users.email, term), ilike(users.name, term))!);
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const baseFrom = this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        userName: users.name,
        userEmail: users.email,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
        itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(users, eq(users.id, orders.userId))
      .groupBy(
        orders.id,
        orders.userId,
        users.name,
        users.email,
        orders.totalPrice,
        orders.status,
        orders.createdAt,
      );

    const countQuery = this.db
      .select({ count: sql<number>`count(distinct ${orders.id})::int` })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId));

    const [rows, countResult] = await Promise.all([
      where
        ? baseFrom.where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset)
        : baseFrom.orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      where
        ? countQuery.where(where)
        : countQuery,
    ]);

    return {
      data: rows.map((r) => this.mapOrderRow(r)),
      total: countResult[0]?.count ?? 0,
      page,
      limit,
    };
  }

  async getActivityFeed(hours = 24): Promise<AdminActivityDto[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const items: AdminActivityDto[] = [];

    const newUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        provider: users.provider,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(gte(users.createdAt, since))
      .orderBy(desc(users.createdAt))
      .limit(20);

    for (const u of newUsers) {
      const at =
        u.createdAt instanceof Date
          ? u.createdAt.toISOString()
          : String(u.createdAt);
      const isGoogle = u.provider === 'google';
      items.push({
        id: `user-${u.id}`,
        type: isGoogle ? 'account.google' : 'account.registered',
        message: isGoogle
          ? `Google sign-up — ${u.name} (${u.email})`
          : `New account — ${u.name} (${u.email})`,
        href: '/admin',
        at,
      });
    }

    const newOrders = await this.db
      .select({
        id: orders.id,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
        userName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(gte(orders.createdAt, since))
      .orderBy(desc(orders.createdAt))
      .limit(30);

    for (const o of newOrders) {
      const at =
        o.createdAt instanceof Date
          ? o.createdAt.toISOString()
          : String(o.createdAt);
      items.push({
        id: `order-placed-${o.id}`,
        type: 'order.placed',
        message: `New order #${o.id} — ${o.userName ?? 'Customer'} · $${Number(o.totalPrice).toFixed(2)}`,
        href: `/admin/orders/${o.id}`,
        at,
      });
    }

    const events = await this.db
      .select({
        id: orderStatusEvents.id,
        orderId: orderStatusEvents.orderId,
        status: orderStatusEvents.status,
        message: orderStatusEvents.message,
        createdAt: orderStatusEvents.createdAt,
        userName: users.name,
        totalPrice: orders.totalPrice,
      })
      .from(orderStatusEvents)
      .innerJoin(orders, eq(orders.id, orderStatusEvents.orderId))
      .leftJoin(users, eq(users.id, orders.userId))
      .where(gte(orderStatusEvents.createdAt, since))
      .orderBy(desc(orderStatusEvents.createdAt))
      .limit(40);

    for (const ev of events) {
      const at =
        ev.createdAt instanceof Date
          ? ev.createdAt.toISOString()
          : String(ev.createdAt);
      if (ev.status === 'PENDING') continue;

      if (ev.status === 'AWAITING_CONFIRMATION') {
        items.push({
          id: `event-${ev.id}`,
          type: 'order.payment_submitted',
          message: `Payment to confirm — Order #${ev.orderId} · ${ev.userName ?? 'Customer'} · $${Number(ev.totalPrice).toFixed(2)}`,
          href: `/admin/orders/${ev.orderId}`,
          at,
        });
      } else if (ev.status === 'PAID') {
        items.push({
          id: `event-${ev.id}`,
          type: 'order.status_updated',
          message: `Payment confirmed — Order #${ev.orderId} · ${ev.userName ?? 'Customer'}`,
          href: `/admin/orders/${ev.orderId}`,
          at,
        });
      } else {
        items.push({
          id: `event-${ev.id}`,
          type: 'order.status_updated',
          message: `Order #${ev.orderId} → ${getOrderStatusLabel(ev.status)} (${ev.userName ?? 'customer'})`,
          href: `/admin/orders/${ev.orderId}`,
          at,
        });
      }
    }

    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return items.slice(0, 50);
  }

  async findOrderById(orderId: number) {
    const orderRow = await this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        userName: users.name,
        userEmail: users.email,
        totalPrice: orders.totalPrice,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderRow[0];
    if (!order) {
      return null;
    }

    const itemRows = await this.db
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

    const itemCount = itemRows.reduce((n, i) => n + i.quantity, 0);

    const base = {
      ...this.mapOrderRow({
        ...order,
        itemCount,
      }),
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

    return attachTimelineToOrder(this.db, base);
  }

  private mapOrderRow(r: {
    id: number;
    userId: number;
    userName: string | null;
    userEmail: string | null;
    totalPrice: string | unknown;
    status: string;
    createdAt: Date | unknown;
    itemCount: number;
  }) {
    return {
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      totalPrice: String(r.totalPrice),
      status: r.status,
      createdAt:
        r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      itemCount: r.itemCount,
    };
  }
}
