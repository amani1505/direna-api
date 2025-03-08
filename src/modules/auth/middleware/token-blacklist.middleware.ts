// File: src/middleware/token-blacklist.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class TokenBlacklistMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Check if token is blacklisted
      if (this.authService.isTokenBlacklisted(token)) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Token has been revoked. Please login again.',
          error: 'Unauthorized',
        });
      }
    }

    next();
  }
}
