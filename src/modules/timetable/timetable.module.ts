import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timetable } from './entities/timetable.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Classes } from '@modules/classes/entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable, Staff, Classes])],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}
