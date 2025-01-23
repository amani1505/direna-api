import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Files } from '@modules/file/entities/file.entity';
import { EquipmentCategory } from '@modules/equipment-category/entities/equipment-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, Files, EquipmentCategory])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}
