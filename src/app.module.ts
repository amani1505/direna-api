import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MemberModule } from './modules/member/member.module';
import { ServicesModule } from './modules/services/services.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { RolesModule } from './modules/roles/roles.module';
import { StaffsModule } from './modules/staffs/staffs.module';
import { ClassesModule } from './modules/classes/classes.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { EquipmentCategoryModule } from './modules/equipment-category/equipment-category.module';
import { BranchSeeder } from '@seeder/branch.seeder';
import { RolesSeeder } from '@seeder/role.seeder';
import { ServiceSeeder } from '@seeder/service.seeder';
import { EquipmentCategorySeeder } from '@seeder/equipment-category.seeders';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),

    DatabaseModule,
    MemberModule,
    ServicesModule,
    BranchesModule,
    UserModule,
    FileModule,
    RolesModule,
    StaffsModule,
    ClassesModule,
    EquipmentModule,
    EquipmentCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly _branchSeeder: BranchSeeder,
    private readonly _serviceSeeder: ServiceSeeder,
    private readonly _roleSeeder: RolesSeeder,
    private readonly _equipmentCategorySeeder: EquipmentCategorySeeder,
  ) {}
  onModuleInit() {
    this._branchSeeder.seed();
    this._serviceSeeder.seed();
    this._roleSeeder.seed();
    this._equipmentCategorySeeder.seed();
  }
}
