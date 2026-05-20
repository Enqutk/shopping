import { Controller, Get, Req, Res, UseGuards, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.issueTokens(
      req.user.id,
      req.user.email,
      req.user.role,
    );

    // Set HttpOnly cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(`${frontendUrl}/login/success`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: { user: { id: number; email: string; role: string } }) {
    const row = await this.usersService.findById(req.user.id);
    if (!row) {
      return req.user;
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar ?? undefined,
      role: row.role,
    };
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
