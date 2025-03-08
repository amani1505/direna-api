import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    this.logger.log(`Required Roles: ${requiredRoles}`);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    this.logger.log(`User: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.error('User not found in request');
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
