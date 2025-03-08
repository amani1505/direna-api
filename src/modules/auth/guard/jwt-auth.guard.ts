import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   canActivate(context: ExecutionContext) {
  //     console.log('JwtAuthGuard: Checking authentication...', context); // Debugging
  //     return super.canActivate(context);
  //   }
  //   handleRequest(err, user, info) {
  //     console.log('JwtAuthGuard: User:', user);
  //     console.log('JwtAuthGuard: Info:', info);
  //     console.log('JwtAuthGuard: Error:', err);
  //     if (err || !user) {
  //       throw err || new UnauthorizedException('Unauthorized');
  //     }
  //     return user;
  //   }
}
