import { Branch } from '@modules/branches/entities/branch.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Service } from '@modules/services/entities/service.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Service, Staff, Member, Equipment]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
