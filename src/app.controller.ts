import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { BlockGuard } from '@modules/auth/guard/block.guard';

@Controller()
@UseGuards(BlockGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
