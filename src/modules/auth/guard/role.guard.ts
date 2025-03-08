import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // If no user in request, authentication failed
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required for this resource',
      );
    }

    // If user exists but has no role
    if (!user.role) {
      throw new UnauthorizedException({
        message: 'User has no role assigned',
        error: 'Missing Role',
        statusCode: 401,
      });
    }

    // Check if the user's role is in the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException({
        message: `Access denied: Required role ${requiredRoles.join(' or ')}`,
        error: 'Insufficient Permissions',
        statusCode: 403,
        requiredRoles: requiredRoles,
        userRole: user.role,
      });
    }

    return true;
  }
}
