/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { RolesService } from '@modules/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly _userService: UserService,
    private _jwtService: JwtService,
    private _roleService: RolesService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this._userService.findOneByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async login(user: User) {
    const roles = await this._roleService.findSingle(user.roleId);
    const payload = {
      username: user.email,
      roles: [roles.name],
      sub: {
        name: user.username,
      },
    };

    return {
      ...user,
      accessToken: this._jwtService.sign(payload),
      refreshToken: this._jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
  async refreshToken(user: User) {
    const roles = await this._roleService.findSingle(user.roleId);
    const payload = {
      username: user.email,
      roles: [roles],
      sub: {
        name: user.username,
      },
    };

    return {
      accessToken: this._jwtService.sign(payload),
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this._jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
