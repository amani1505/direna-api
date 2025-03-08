import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesSeeder } from '@seeder/role.seeder';
import { RoleAction } from '@modules/role-actions/entities/role-action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RoleAction])],
  controllers: [RolesController],
  providers: [RolesService, RolesSeeder],
  exports: [RolesSeeder],
})
export class RolesModule {}
