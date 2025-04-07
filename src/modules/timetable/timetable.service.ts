import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Timetable } from './entities/timetable.entity';
import { Repository } from 'typeorm';
import { Classes } from '@modules/classes/entities/class.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Timetable)
    private _timetableRepository: Repository<Timetable>,

    @InjectRepository(Classes)
    private _classRepository: Repository<Classes>,
    @InjectRepository(Staff)
    private _staffRepository: Repository<Staff>,
  ) {}
  async create(createTimetableDto: CreateTimetableDto): Promise<Timetable> {
    try {
      // Validate entities exist
      const [gymClass, trainer] = await Promise.all([
        this._classRepository.findOne({
          where: { id: createTimetableDto.classId },
        }),
        this._staffRepository.findOne({
          where: { id: createTimetableDto.trainerId },
        }),
      ]);

      if (!gymClass) {
        throw new NotFoundException(
          `Class with ID ${createTimetableDto.classId} not found`,
        );
      }
      if (!trainer) {
        throw new NotFoundException(
          `Trainer with ID ${createTimetableDto.trainerId} not found`,
        );
      }

      const startTime = new Date(createTimetableDto.start_time);
      let endTime: Date;

      // Use provided end time or calculate from class default duration
      if (createTimetableDto.end_time) {
        endTime = new Date(createTimetableDto.end_time);
      } else {
        endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + gymClass.default_duration);
      }

      // Validate times
      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Use provided max participants or default from class
      const maxParticipants =
        createTimetableDto.max_participants || gymClass.capacity;

      // Check for room scheduling conflicts
      // await this.checkRoomConflicts(room.id, null, startTime, endTime);

      // Check for trainer scheduling conflicts
      await this.checkTrainerConflicts(trainer.id, null, startTime, endTime);

      const timetableEntry = this._timetableRepository.create({
        ...createTimetableDto,
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants,
        classId: gymClass.id,
        trainerId: trainer.id,
      });

      return await this._timetableRepository.save(timetableEntry);
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<Timetable[]> {
    try {
      return await this._timetableRepository.find({
        // where: { is_active: true },
        relations: ['class', 'trainer'],
        order: {
          start_time: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve timetable: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Timetable> {
    try {
      const entry = await this._timetableRepository.findOne({
        where: { id },
        relations: ['class', 'trainer'],
      });

      if (!entry) {
        throw new NotFoundException(`Timetable entry with ID ${id} not found`);
      }

      return entry;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to retrieve Timetable: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateTimetableDto: UpdateTimetableDto,
  ): Promise<Timetable> {
    try {
      const entry = await this.findOne(id);

      let startTime = entry.start_time;
      let endTime = entry.end_time;
      let classId = entry.classId;
      let trainerId = entry.trainerId;
      let gymClass = entry.class;

      // Check and update class reference if needed
      if (
        updateTimetableDto.classId &&
        updateTimetableDto.classId !== entry.classId
      ) {
        gymClass = await this._classRepository.findOne({
          where: { id: updateTimetableDto.classId },
        });
        if (!gymClass) {
          throw new NotFoundException(
            `Class with ID ${updateTimetableDto.classId} not found`,
          );
        }
        classId = updateTimetableDto.classId;
      }

      // Check and update trainer if needed
      if (
        updateTimetableDto.trainerId &&
        updateTimetableDto.trainerId !== entry.trainerId
      ) {
        const trainer = await this._staffRepository.findOne({
          where: { id: updateTimetableDto.trainerId },
        });
        if (!trainer) {
          throw new NotFoundException(
            `Trainer with ID ${updateTimetableDto.trainerId} not found`,
          );
        }
        trainerId = updateTimetableDto.trainerId;
      }

      // Check and update room if needed

      // Update time if provided
      if (updateTimetableDto.start_time) {
        startTime = new Date(updateTimetableDto.start_time);
      }

      if (updateTimetableDto.end_time) {
        endTime = new Date(updateTimetableDto.end_time);
      } else if (
        updateTimetableDto.start_time &&
        !updateTimetableDto.end_time
      ) {
        // If only start time is updated, recalculate end time based on class duration
        endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + gymClass.default_duration);
      }

      // Validate new times
      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Check for trainer conflicts
      if (
        updateTimetableDto.start_time ||
        updateTimetableDto.end_time ||
        updateTimetableDto.trainerId
      ) {
        await this.checkTrainerConflicts(trainerId, id, startTime, endTime);
      }

      Object.assign(entry, {
        ...updateTimetableDto,
        start_time: startTime,
        end_time: endTime,
        classId,
        trainerId,
      });

      return await this._timetableRepository.save(entry);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update timetable entry: ${error.message}`,
      );
      throw error;
    }
  }

  private async checkTrainerConflicts(
    trainerId: string,
    currentId: string | null,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    // Find any entries for the same trainer with overlapping times
    const query = this._timetableRepository
      .createQueryBuilder('entry')
      .where('entry.trainerId = :trainerId', { trainerId })
      .andWhere('entry.is_active = true')
      .andWhere(
        `(
          (entry.start_time <= :start_time AND entry.end_time > :start_time) OR
          (entry.start_time < :end_time AND entry.end_time >= :end_time) OR
          (entry.start_time >= :start_time AND entry.end_time <= :end_time)
        )`,
        { startTime, endTime },
      );

    // Exclude current entry if updating
    if (currentId) {
      query.andWhere('entry.id != :currentId', { currentId });
    }

    const conflicts = await query.getMany();

    if (conflicts.length > 0) {
      throw new ConflictException(
        `Trainer scheduling conflict: Trainer is already booked during the requested time period.`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const entry = await this.findOne(id);
      await this._timetableRepository.remove(entry);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to remove timetable entry with ID ${id}: ${error.message}`,
      );
    }
  }
}
