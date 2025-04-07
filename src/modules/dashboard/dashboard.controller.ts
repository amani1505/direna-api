import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { DashboardData } from '@interface/dashboard';
// import { RolesGuard } from '@modules/auth/guard/role.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly _dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(): Promise<DashboardData> {
    return this._dashboardService.getDashboardStats();
  }
}
