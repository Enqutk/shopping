import {
  ConflictException,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@shopping/database';
import { users } from '@shopping/database';
import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  async findByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const result = await this.db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${normalized}`)
      .limit(1);
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

  async registerWithPassword(input: {
    name: string;
    email: string;
    password: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.provider === 'google') {
        throw new ConflictException(
          'This email is already linked to Google. Sign in with Google instead.',
        );
      }
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const inserted = await this.db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        password: passwordHash,
        provider: 'local',
        role: 'USER',
      })
      .returning();
    return inserted[0];
  }

  async validateLocalLogin(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.findByEmail(normalized);
    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
