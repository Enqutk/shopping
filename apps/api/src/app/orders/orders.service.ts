import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION, orderItems, orders, products } from '@shopping/database';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CheckoutDto, CheckoutLineDto } from './checkout.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type MergedLine = { productId: number; quantity: number };

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
    private readonly realtime: RealtimeGateway,
  ) {}

  private mergeLines(items: CheckoutLineDto[]): MergedLine[] {
    const map = new Map<number, number>();
    for (const row of items) {
      map.set(row.productId, (map.get(row.productId) ?? 0) + row.quantity);
    }
    return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
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

      return this.findOneForUser(userId, order.id, tx);
    });

    this.realtime.emitOrderCreated(userId, result);
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
        productName: products.name,
        productImageUrl: products.imageUrl,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, orderId));

    return {
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
        productName: row.productName,
        productImageUrl: row.productImageUrl,
      })),
    };
  }

  async findOneByIdForAdmin(orderId: number) {
    const orderRow = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = orderRow[0];
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }

  async updateStatusByAdmin(
    orderId: number,
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED',
  ) {
    const existing = await this.findOneByIdForAdmin(orderId);
    await this.db.update(orders).set({ status }).where(eq(orders.id, orderId));
    this.realtime.emitOrderStatus(existing.userId, { orderId, status });
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
