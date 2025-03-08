import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { BlockGuard } from '@modules/auth/guard/block.guard';
import { UserService } from '@modules/user/user.service';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { SessionGuard } from '@modules/auth/guard/session.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly _userService: UserService,
  ) {}

  @UseGuards(BlockGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Get('me')
  findOne(@Request() req) {
    const userId = req.session.userId;
    return this._userService.getProfile(userId);
  }
}
