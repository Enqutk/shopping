/**
 * Creates or promotes the default admin account for local review.
 * Usage: npx tsx scripts/seed-admin.ts
 */
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { users } from '../libs/database/src/lib/schema';

const ADMIN_EMAIL = 'admin@luxe.com';
const ADMIN_PASSWORD = 'LuxeAdmin123!';
const ADMIN_NAME = 'LUXE Admin';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL before running (see .env).');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: url });
  const db = drizzle(pool);
  const email = ADMIN_EMAIL.toLowerCase();

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing[0]) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, email));
    console.log(`Promoted existing user to ADMIN: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(users).values({
      name: ADMIN_NAME,
      email,
      password: passwordHash,
      provider: 'local',
      role: 'ADMIN',
    });
    console.log(`Created admin user: ${email}`);
  }

  console.log(`Sign in at http://localhost:4200/login`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
