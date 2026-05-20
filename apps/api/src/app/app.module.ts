import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
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
        /** Must match an "Authorized redirect URI" in Google Cloud (defaults to local API). */
        GOOGLE_CALLBACK_URL: Joi.string().optional(),
        FRONTEND_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shopping'),
    AuthModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
