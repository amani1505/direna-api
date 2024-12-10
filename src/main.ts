import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  app.enableCors({ credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip out unknown properties
      forbidNonWhitelisted: true, // Throw an error for unknown properties
      transform: true, // Transform payloads into DTO instances
    }),
  );

  const appPort = process.env.APP_PORT || 4000;
  const appHost = process.env.APP_HOST || '0.0.0.0';
  app.setGlobalPrefix('api');
  await app.listen(appPort, appHost);
}
bootstrap();
