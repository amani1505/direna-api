import { Injectable, CanActivate, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BlockGuard implements CanActivate {
  canActivate(): boolean {
    throw new ForbiddenException('Access to this endpoint is not allowed.');
  }
}
