import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app/app.module';
import type { RequestHandler } from 'express';

// CJS interop under webpack (`nx serve api`)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => RequestHandler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useWebSocketAdapter(new IoAdapter(app));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const helmet = require('helmet') as () => RequestHandler;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const compression = require('compression') as () => RequestHandler;
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Cookie Parser
  app.use(cookieParser());

  // Enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = Number(process.env.PORT) || 3000;
  try {
    await app.listen(port);
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? (err as { code?: string }).code
        : undefined;
    if (code === 'EADDRINUSE') {
      Logger.error(
        `Port ${port} is already in use. Stop the Next.js dev server on :3000 ` +
          `and run the frontend on :4200 (npx nx dev frontend), then restart the API.`,
      );
    }
    throw err;
  }
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
