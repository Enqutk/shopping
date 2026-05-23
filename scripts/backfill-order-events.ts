/**
 * Sync order_status_events for all orders (fills missing Paid/Delivered steps).
 * Usage: DATABASE_URL=postgresql://... npx tsx scripts/backfill-order-events.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { backfillOrderEventsFromOrders } from '../apps/api/src/app/orders/order-timeline.helper';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Set DATABASE_URL');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  await backfillOrderEventsFromOrders(db);
  console.log('Order status events synced for all orders.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
