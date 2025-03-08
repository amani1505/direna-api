import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  app.enableCors({ credentials: true, origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip out unknown properties
      forbidNonWhitelisted: true, // Throw an error for unknown properties
      transform: true, // Transform payloads into DTO instances
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  const appPort = process.env.APP_PORT || 4000;
  const appHost = process.env.APP_HOST || '0.0.0.0';
  app.setGlobalPrefix('api');

  app.use(
    session({
      secret: process.env.JWT_SECRET, // Replace with a strong secret key
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // Session expires in 1 hour
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      }, // Session expires in 1 hour
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(appPort, appHost);
}
bootstrap();
