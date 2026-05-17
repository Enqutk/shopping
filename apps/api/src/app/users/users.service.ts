import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@shopping/database';
import { users } from '@shopping/database';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async findByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async findById(id: number) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async findOrCreate(profile: { name: string; email: string; avatar?: string; provider: string }) {
    let user = await this.findByEmail(profile.email);
    if (!user) {
      const inserted = await this.db.insert(users).values({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        provider: profile.provider,
        role: 'USER',
      }).returning();
      user = inserted[0];
    }
    return user;
  }
}
