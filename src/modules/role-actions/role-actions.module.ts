import { Module } from '@nestjs/common';
import { RoleActionsService } from './role-actions.service';
import { RoleActionsController } from './role-actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '@modules/role-modules/entities/role-module.entity';
import { RoleAction } from './entities/role-action.entity';
import { RoleActionsSeeder } from '@seeder/role-action.seedet';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAction, RoleModule])],
  controllers: [RoleActionsController],
  providers: [RoleActionsService, RoleActionsSeeder],
  exports: [RoleActionsSeeder],
})
export class RoleActionsModule {}
