import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION, products } from '@shopping/database';
import { categoryFilterValues } from '@shopping/shared';
import { and, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import type { ProductColorOptionDto } from './product-variant.dto';

function normalizeColors(
  colors?: ProductColorOptionDto[] | null,
): { name: string; hex: string }[] | null {
  if (colors == null) return null;
  const cleaned = colors
    .map((c) => ({
      name: c.name.trim(),
      hex: c.hex.trim(),
    }))
    .filter((c) => c.name.length > 0);
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeSizes(sizes?: string[] | null): string[] | null {
  if (sizes == null) return null;
  const cleaned = sizes.map((s) => s.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
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
      const values = categoryFilterValues(query.category);
      if (values && values.length > 1) {
        conditions.push(inArray(products.category, values));
      } else if (values) {
        conditions.push(eq(products.category, values[0]));
      } else {
        conditions.push(eq(products.category, query.category));
      }
    }

    if (query.minPrice != null && !Number.isNaN(query.minPrice) && query.minPrice >= 0) {
      conditions.push(gte(products.price, String(query.minPrice)));
    }

    if (query.maxPrice != null && !Number.isNaN(query.maxPrice) && query.maxPrice >= 0) {
      conditions.push(lte(products.price, String(query.maxPrice)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const newestFirst = [
      sql`${products.createdAt} desc`,
      sql`${products.id} desc`,
    ];

    const [data, countResult] = await Promise.all([
      where
        ? this.db
            .select()
            .from(products)
            .where(where)
            .orderBy(...newestFirst)
            .limit(limit)
            .offset(offset)
        : this.db
            .select()
            .from(products)
            .orderBy(...newestFirst)
            .limit(limit)
            .offset(offset),
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
        availableColors: normalizeColors(dto.availableColors),
        availableSizes: normalizeSizes(dto.availableSizes),
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
        ...(dto.availableColors !== undefined && {
          availableColors: normalizeColors(dto.availableColors),
        }),
        ...(dto.availableSizes !== undefined && {
          availableSizes: normalizeSizes(dto.availableSizes),
        }),
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
