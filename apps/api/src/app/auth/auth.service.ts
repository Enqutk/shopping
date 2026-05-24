import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DATABASE_CONNECTION, refreshTokens, users } from '@shopping/database';
import { and, eq, gt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<any>,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async revokeRefreshToken(token: string) {
    const tokenHash = this.hashToken(token);
    await this.db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async refreshAccessToken(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.revoked, false),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new UnauthorizedException();
    }

    const userRows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
