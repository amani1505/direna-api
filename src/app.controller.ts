import { Controller, Get, UseGuards, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { BlockGuard } from '@modules/auth/guard/block.guard';
import { UserService } from '@modules/user/user.service';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { SessionGuard } from '@modules/auth/guard/session.guard';
import { AuthService } from '@modules/auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly _userService: UserService,
    private readonly _authService: AuthService,
  ) {}

  @UseGuards(BlockGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Get('me')
  async findOne(@Headers('authorization') authorizationHeader: string) {
    const token = authorizationHeader.replace('Bearer ', '');
    const user = await this._authService.verifyToken(token);

    return this._userService.getProfile(user.id);
  }
}
