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
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private tokenBlacklist: Set<string> = new Set();
  // Optional: Store tokens with their expiry time for cleanup
  private tokenExpiryMap: Map<string, number> = new Map();
  constructor(
    private _jwtService: JwtService,
    private _roleService: RolesService,
    private _userService: UserService,
    private _mailService: MailService,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;

    return {
      user: userData,
      accessToken: this._jwtService.sign(payload),
      refreshToken: this._jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
  async changePassword(
    passwords: { password: string; newPassword: string },
    userId: string,
  ) {
    try {
      // Step 1: Find the user by ID
      const user = await this._userService.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Step 2: Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(
        passwords.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      // Step 4: Update the user's password
      await this._userService.update(user.id, {
        password: passwords.newPassword,
      });

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known errors
      }
      throw new InternalServerErrorException(
        `An error occurred while updating the password: ${error.message}`,
      );
    }
  }

  async forgetPassword(email: string) {
    try {
      // Step 1: Find the user by email
      const user = await this._userService.findOneByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Step 2: Generate a new password
      const newPassword = Math.random().toString(36).slice(-8);

      // Step 3: Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Step 4: Update the user's password
      await this._userService.update(user.id, { password: hashedPassword });

      await this._mailService.sendMail(
        email, // Assuming username is the email
        'Welcome to Direna Health Support Platform!',
        `Hello ${user.first_name + ' ' + user.last_name},\n\nYour Password has been Reseted successfully. Here is your new Password\n\n New Password: ${newPassword}\n\nPlease change your password after logging in.`,
      );

      return {
        message: 'Password reset successfully Please Check your email',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known errors
      }
      throw new InternalServerErrorException(
        `An error occurred while resetting the password: ${error.message}`,
      );
    }
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
