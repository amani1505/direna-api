import {
  Controller,
  Post,
  Request,
  UseGuards,
  Response,
  HttpStatus,
  Headers,
  UnauthorizedException,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RefreshJwtAuthGuard } from './guard/refresh-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

import { SessionGuard } from './guard/session.guard';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      req.session.userId = req.user.id;
      return await this._authService.login(req.user);
    } catch (error) {
      // Handle specific errors
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Request() req) {
    return await this._authService.refreshToken(req.user);
  }

  // @Get('signInWithToken')
  // async signInWithToken(
  //   @Headers('authorization') authorizationHeader: string,
  // ): Promise<{ message: string }> {
  //   try {
  //     return { message: 'Sign-in with token successful' };
  //   } catch (error) {
  //     throw new UnauthorizedException(`${error.message}`);
  //   }
  // }

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Post('logout')
  async logout(
    @Request() req,
    @Headers('authorization') authorizationHeader: string,
    @Response() res,
  ) {
    if (!authorizationHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authorizationHeader.replace('Bearer ', '');

    // Blacklist token
    this._authService.addToBlacklist(token);

    req.session.destroy((err: any) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to logout',
        });
      } else {
        res.clearCookie('connect.sid'); // Remove session cookie
        return res.status(HttpStatus.OK).json({
          message: 'Logout successful',
        });
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('signInWithToken')
  async signInWithToken(
    @Headers('authorization') authorizationHeader: string,
  ): Promise<{ message: string }> {
    try {
      const token = authorizationHeader.replace('Bearer ', ''); // Extract the token from the "Bearer " prefix
      await this._authService.verifyToken(token);

      return { message: 'Sign-in with token successful' };
    } catch (error) {
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }
  }
}
