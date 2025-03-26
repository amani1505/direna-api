import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/user/entities/user.entity';
import { RolesService } from '@modules/roles/roles.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private tokenBlacklist: Set<string> = new Set();
  // Optional: Store tokens with their expiry time for cleanup
  private tokenExpiryMap: Map<string, number> = new Map();
  constructor(
    private _jwtService: JwtService,
    private _roleService: RolesService,
    private _userService: UserService,
  ) {}

  onModuleInit() {
    // Set up a periodic cleanup of expired tokens (every hour)
    setInterval(() => this.cleanupExpiredTokens(), 3600000);
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      // Step 1: Find the user by username
      const user = await this._userService.findOneByUsername(username);
      if (!user) {
        throw new BadRequestException(
          'Invalid credentials::Please Enter valid credentials',
        );
      }

      // Step 2: Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (user && !isPasswordValid) {
        throw new BadRequestException(
          'Invalid credentials::Please Enter valid credentials',
        );
      }

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known errors
      }
      throw new InternalServerErrorException(
        `An error occurred while validating the user: ${error.message}`,
      );
    }
  }

  async login(user: User) {
    const roles = await this._roleService.findSingle(user.roleId);
    const payload = {
      id: user.id,
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
      id: user.id,
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

  addToBlacklist(token: string): void {
    try {
      // Add to blacklist
      this.tokenBlacklist.add(token);

      // Get token expiration
      const decoded = this._jwtService.decode(token);
      if (decoded && decoded.exp) {
        this.tokenExpiryMap.set(token, decoded.exp);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // Check if a token is blacklisted
  isTokenBlacklisted(token: string): boolean {
    try {
      return this.tokenBlacklist.has(token);
    } catch (error) {
      throw new HttpException(
        `Failed to get!:${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private cleanupExpiredTokens() {
    try {
      const now = Math.floor(Date.now() / 1000);
      for (const [token, expiry] of this.tokenExpiryMap.entries()) {
        if (expiry <= now) {
          this.tokenBlacklist.delete(token);
          this.tokenExpiryMap.delete(token);
        }
      }
    } catch (error) {
      throw new HttpException(
        `Failed to delete!:${error.message}`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this._jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }
}
