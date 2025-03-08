import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class SessionGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    if (this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException(
        'Token is blacklisted. Please log in again.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`${error.message}`, error);
    }
  }
}
