import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GoogleOAuthConfiguredGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RealtimeModule } from '../realtime/realtime.module';
const authProviders = [
  AuthService,
  JwtStrategy,
  GoogleOAuthConfiguredGuard,
  GoogleStrategy,
];

@Module({
  imports: [
    UsersModule,
    RealtimeModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: authProviders,
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
