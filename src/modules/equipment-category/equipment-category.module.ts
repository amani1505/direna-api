import { Module } from '@nestjs/common';
import { EquipmentCategoryService } from './equipment-category.service';
import { EquipmentCategoryController } from './equipment-category.controller';
import { EquipmentCategorySeeder } from '@seeder/equipment-category.seeders';
import { EquipmentCategory } from './entities/equipment-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentCategory])],
  controllers: [EquipmentCategoryController],
  providers: [EquipmentCategoryService, EquipmentCategorySeeder],
  exports: [EquipmentCategorySeeder],
})
export class EquipmentCategoryModule {}
