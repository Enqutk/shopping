import type { ProductColorOption } from '../product-options.js';

export type { ProductColorOption };

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: string; // numeric from Postgres comes as string
  imageUrl?: string | null;
  stock: number;
  category?: string | null;
  availableColors?: ProductColorOption[] | null;
  availableSizes?: string[] | null;
  createdAt: Date;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  category?: string;
  availableColors?: ProductColorOption[] | null;
  availableSizes?: string[] | null;
}
