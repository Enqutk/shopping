import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

/** Drizzle client typed with this app's schema (use instead of NodePgDatabase<any>). */
export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;
