import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type AdminActivityType =
  | 'order.placed'
  | 'account.registered'
  | 'account.google'
  | 'order.status_updated';

export interface AdminActivityPayload {
  type: AdminActivityType;
  message: string;
  href?: string;
  at: string;
  meta?: {
    orderId?: number;
    userId?: number;
    userName?: string;
    userEmail?: string;
    status?: string;
  };
}

function getCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token =
      getCookie(client.handshake.headers.cookie, 'access_token') ||
      (typeof client.handshake.auth?.token === 'string'
        ? (client.handshake.auth.token as string)
        : undefined);

    if (!token) {
      this.logger.warn('Socket disconnected: no access_token');
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; role?: string }>(token);
      const userId = payload.sub;
      const role = payload.role;
      client.data.userId = userId;
      client.data.role = role;
      client.join(`user:${userId}`);
      if (role === 'ADMIN') {
        client.join('admin');
      }
    } catch {
      this.logger.warn('Socket disconnected: invalid JWT');
      client.disconnect(true);
    }
  }

  emitAdminActivity(
    payload: Omit<AdminActivityPayload, 'at'> & { at?: string },
  ) {
    const body: AdminActivityPayload = {
      ...payload,
      at: payload.at ?? new Date().toISOString(),
    };
    this.server.to('admin').emit('admin:activity', body);
  }

  emitOrderCreated(userId: number, order: unknown) {
    this.server.to(`user:${userId}`).emit('order:created', { order, scope: 'self' });
  }

  emitOrderStatus(userId: number, payload: { orderId: number; status: string }) {
    this.server.to(`user:${userId}`).emit('order:status', payload);
  }

  emitAdminNotification(message: string, audience: 'admin' | 'all') {
    const body = { message, at: new Date().toISOString() };
    if (audience === 'admin') {
      this.server.to('admin').emit('admin:notification', body);
    } else {
      this.server.emit('admin:notification', body);
    }
  }
}
