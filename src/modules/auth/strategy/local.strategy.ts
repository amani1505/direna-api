import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private _authService: AuthService) {
    super({
      usernameField: 'username', // Use 'email' as the username field
    });
  }
  async validate(username: string, password: string) {
    try {
      const user = await this._authService.validateUser(username, password);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      return user;
    } catch (error) {
      // Always throw "Invalid credentials" for any error
      throw new BadRequestException(` ${error.message}`);
    }
  }
}
