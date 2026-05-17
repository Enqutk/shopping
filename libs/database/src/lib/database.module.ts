import { Global, Module, DynamicModule } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(connectionString: string): DynamicModule {
    const pool = new Pool({
      connectionString,
    });

    const db = drizzle(pool, { schema });

    const dbProvider = {
      provide: DATABASE_CONNECTION,
      useValue: db,
    };

    return {
      module: DatabaseModule,
      providers: [dbProvider],
      exports: [dbProvider],
    };
  }
}
