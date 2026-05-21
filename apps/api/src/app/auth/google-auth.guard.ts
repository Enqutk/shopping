import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { isGoogleOAuthEnabled } from './google-oauth.util';

/** Blocks Google routes when OAuth env vars are missing (strategy not registered). */
@Injectable()
export class GoogleOAuthConfiguredGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (
      isGoogleOAuthEnabled({
        clientId: this.config.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      })
    ) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ headers: { accept?: string } }>();
    const wantsHtml = (req.headers.accept ?? '').includes('text/html');
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    const message =
      'Google sign-in is not configured. Use email sign-up or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.';

    if (wantsHtml) {
      const res = context.switchToHttp().getResponse<Response>();
      res.redirect(`${frontend}/login?error=${encodeURIComponent(message)}`);
      return false;
    }

    throw new ServiceUnavailableException(message);
  }
}
