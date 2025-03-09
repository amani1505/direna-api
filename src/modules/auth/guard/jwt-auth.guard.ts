// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   //   canActivate(context: ExecutionContext) {
//   //     console.log('JwtAuthGuard: Checking authentication...', context); // Debugging
//   //     return super.canActivate(context);
//   //   }
//   //   handleRequest(err, user, info) {
//   //     console.log('JwtAuthGuard: User:', user);
//   //     console.log('JwtAuthGuard: Info:', info);
//   //     console.log('JwtAuthGuard: Error:', err);
//   //     if (err || !user) {
//   //       throw err || new UnauthorizedException('Unauthorized');
//   //     }
//   //     return user;
//   //   }
// }

// File: src/modules/auth/guard/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // Extract token from headers
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    if (this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // If not blacklisted, continue with normal JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // If there is an error or no user, throw an exception
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
