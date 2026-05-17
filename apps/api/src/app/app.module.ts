import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '@shopping/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shopping'),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
