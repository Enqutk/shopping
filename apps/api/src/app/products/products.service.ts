import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION, products } from '@shopping/database';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async findAll(query: ProductQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (query.search) {
      conditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.description, `%${query.search}%`),
        ),
      );
    }

    if (query.category) {
      conditions.push(eq(products.category, query.category));
    }

    const where = conditions.length > 0
      ? conditions.reduce((acc, cond) => (acc ? sql`${acc} AND ${cond}` : cond))
      : undefined;

    const [data, countResult] = await Promise.all([
      where
        ? this.db.select().from(products).where(where).limit(limit).offset(offset)
        : this.db.select().from(products).limit(limit).offset(offset),
      where
        ? this.db.select({ count: sql<number>`count(*)` }).from(products).where(where)
        : this.db.select({ count: sql<number>`count(*)` }).from(products),
    ]);

    return {
      data,
      total: Number(countResult[0].count),
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return result[0];
  }

  async create(dto: CreateProductDto) {
    const inserted = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description,
        price: String(dto.price),
        imageUrl: dto.imageUrl,
        stock: dto.stock ?? 0,
        category: dto.category,
      })
      .returning();
    return inserted[0];
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id); // throws NotFoundException if missing

    const updated = await this.db
      .update(products)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: String(dto.price) }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.category !== undefined && { category: dto.category }),
      })
      .where(eq(products.id, id))
      .returning();
    return updated[0];
  }

  async remove(id: number) {
    await this.findOne(id); // throws NotFoundException if missing
    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}
