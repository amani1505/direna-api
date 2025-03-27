import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'dotenv';
import { UserService } from '@modules/user/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private _userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      if (!payload.sub || !payload.username) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this._userService.findOneByEmail(payload.username);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.role || !user.role.name) {
        throw new UnauthorizedException('User has no role assigned');
      }

      return {
        id: user.id,
        username: payload.sub.name,
        email: payload.username,
        role: user.role.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token validation failed');
    }
  }
}
