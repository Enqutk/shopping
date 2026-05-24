/**
 * Seeds demo products for every storefront category.
 * Usage: DATABASE_URL=postgresql://... npx tsx scripts/seed-products.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { products } from '../libs/database/src/lib/schema';

const SAMPLE_PRODUCTS = [
  {
    name: 'Arctic Runner Sneaker',
    description: 'Lightweight street runner with matte finish.',
    price: '129.00',
    stock: 24,
    category: 'shoes',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Slate Leather Boot',
    description: 'Premium leather boot for all-season wear.',
    price: '189.00',
    stock: 12,
    category: 'shoes',
    imageUrl:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Minimal Wool Coat',
    description: 'Structured wool coat in charcoal neutral.',
    price: '249.00',
    stock: 8,
    category: 'clothes',
    imageUrl:
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Silk Evening Blouse',
    description: 'Fluid silk blouse with relaxed drape.',
    price: '98.00',
    stock: 18,
    category: 'clothes',
    imageUrl:
      'https://images.unsplash.com/photo-1485968579580-b6d095bcff51?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Champagne Tote',
    description: 'Structured tote with metallic hardware.',
    price: '145.00',
    stock: 15,
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Steel Link Watch',
    description: 'Slim profile watch with brushed steel case.',
    price: '220.00',
    stock: 10,
    category: 'accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Nordic Lounge Chair',
    description: 'Low-profile lounge chair with oak legs.',
    price: '399.00',
    stock: 6,
    category: 'furniture',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Marble Side Table',
    description: 'Compact side table with marble top.',
    price: '175.00',
    stock: 9,
    category: 'furniture',
    imageUrl:
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Studio Headphones',
    description: 'Over-ear headphones with noise isolation.',
    price: '159.00',
    stock: 20,
    category: 'electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Wireless Earbuds Pro',
    description: 'Compact earbuds with charging case.',
    price: '89.00',
    stock: 30,
    category: 'electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  },
] as const;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL before running the seed.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: url });
  const db = drizzle(pool);

  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log('Products already exist; skipping seed (delete rows first to re-seed).');
    await pool.end();
    return;
  }

  await db.insert(products).values([...SAMPLE_PRODUCTS]);
  console.log(`Seeded ${SAMPLE_PRODUCTS.length} products across all categories.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
