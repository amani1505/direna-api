import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Classes } from './entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Classes])],
  exports: [ClassesService],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
