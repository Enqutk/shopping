import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { GoogleOAuthConfiguredGuard } from './google-auth.guard';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type AuthUser = {
  id: number;
  email: string;
  role: string;
  name?: string;
  avatar?: string | null;
};

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
    private realtime: RealtimeGateway,
  ) {}

  private async issueSession(user: AuthUser) {
    return this.authService.issueTokens(user.id, user.email, user.role);
  }

  private clearLegacyCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private sessionResponse(
    user: AuthUser & { name: string; avatar?: string | null },
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return {
      user: this.toProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        role: user.role,
      }),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private toProfile(row: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  }) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar ?? undefined,
      role: row.role,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    this.clearLegacyCookies(res);
    const user = await this.usersService.registerWithPassword(dto);
    const tokens = await this.issueSession(user);
    this.realtime.emitAdminActivity({
      type: 'account.registered',
      message: `New account · ${user.name} (${user.email})`,
      href: '/admin',
      meta: { userId: user.id, userName: user.name, userEmail: user.email },
    });
    return this.sessionResponse(user, tokens);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    this.clearLegacyCookies(res);
    const user = await this.usersService.validateLocalLogin(dto.email, dto.password);
    const tokens = await this.issueSession(user);
    return this.sessionResponse(user, tokens);
  }

  @Get('google')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
  googleAuth(@Req() req: { url?: string }) {
    this.logger.log(`GET ${req.url ?? '/auth/google'}: handing off to Passport (redirect to Google)`);
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthConfiguredGuard, AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: { user: AuthUser & { isNewAccount?: boolean }; url?: string },
    @Res() res: Response,
  ) {
    this.logger.log(`GET ${req.url ?? '/auth/google/callback'}: user ${req.user.email}`);
    const tokens = await this.issueSession(req.user);
    if (req.user.isNewAccount) {
      this.realtime.emitAdminActivity({
        type: 'account.google',
        message: `Google sign-up · ${req.user.name} (${req.user.email})`,
        href: '/admin',
        meta: {
          userId: req.user.id,
          userName: req.user.name,
          userEmail: req.user.email,
        },
      });
    }
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.replace(/\/$/, '');
    const hash = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    }).toString();
    return res.redirect(`${frontendUrl}/login/success#${hash}`);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
  ) {
    const raw = body?.refreshToken || req.cookies['refresh_token'];
    if (!raw) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.authService.refreshAccessToken(raw);
    return { ok: true, accessToken };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: { user: { id: number; email: string; role: string } }) {
    const row = await this.usersService.findById(req.user.id);
    if (!row) {
      return req.user;
    }
    return this.toProfile(row);
  }

  @Delete('logout')
  async logout(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res() res: Response,
  ) {
    const refreshToken = body?.refreshToken || req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({ success: true });
  }
}
