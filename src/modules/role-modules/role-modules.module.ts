import { Module } from '@nestjs/common';
import { RoleModulesService } from './role-modules.service';
import { RoleModulesController } from './role-modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from './entities/role-module.entity';
import { RoleModulesSeeder } from '@seeder/role-module.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([RoleModule])],
  controllers: [RoleModulesController],
  providers: [RoleModulesService, RoleModulesSeeder],
  exports: [RoleModulesSeeder],
})
export class RoleModulesModule {}
