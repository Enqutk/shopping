import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { GoogleOAuthConfiguredGuard } from './google-auth.guard';
import { isGoogleOAuthEnabled } from './google-oauth.util';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const passport = require('passport') as typeof import('passport');

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  private async attachSession(
    res: Response,
    user: { id: number; email: string; role: string },
  ) {
    const { accessToken, refreshToken } = await this.authService.issueTokens(
      user.id,
      user.email,
      user.role,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
    const user = await this.usersService.registerWithPassword(dto);
    await this.attachSession(res, user);
    return { user: this.toProfile(user) };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.usersService.validateLocalLogin(dto.email, dto.password);
    await this.attachSession(res, user);
    return { user: this.toProfile(user) };
  }

  @Get('google')
  @UseGuards(GoogleOAuthConfiguredGuard)
  googleAuth(@Req() req: Request, @Res() res: Response) {
    if (
      !isGoogleOAuthEnabled({
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      })
    ) {
      return;
    }
    return passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthConfiguredGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (
      !isGoogleOAuthEnabled({
        clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      })
    ) {
      return;
    }

    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200'}/login?error=google_auth_failed`,
    })(req, res, async (err: Error | null, user: Express.User | false) => {
      if (err || !user) {
        const frontend =
          this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
        return res.redirect(
          `${frontend}/login?error=${encodeURIComponent('Google sign-in failed')}`,
        );
      }

      await this.attachSession(res, user as { id: number; email: string; role: string });
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/login/success`);
    });
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
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({ success: true });
  }
}
