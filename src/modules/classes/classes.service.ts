import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Classes } from './entities/class.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getMetadataArgsStorage, In, Repository } from 'typeorm';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes)
    private readonly _classesRepository: Repository<Classes>,
    @InjectRepository(Staff)
    private readonly _staffRepository: Repository<Staff>,
  ) {}
  async create(createClassDto: CreateClassDto): Promise<Classes> {
    try {
      const { staffIds, ...classData } = createClassDto;

      const trainers = await this._staffRepository.find({
        where: { id: In(staffIds) },
      });
      if (trainers.length !== staffIds.length) {
        throw new NotFoundException(`One or more trainer not found`);
      }
      const createdClass = this._classesRepository.create({
        ...classData,
        instructors: trainers,
      });

      const classCreated = await this._classesRepository.save(createdClass);
      return classCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Classes> | Classes[]> {
    try {
      const { relations = [], sortBy = 'name', sortOrder = 'ASC' } = query;

      const queryBuilder =
        this._classesRepository.createQueryBuilder('classes');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Classes)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`classes.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'classes',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  async findOne(id: string, query: any): Promise<Classes> {
    const { relations = [] } = query;

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Classes)
      .map((relation) => relation.propertyName);

    relations.forEach((relation: string) => {
      if (!validRelations.includes(relation)) {
        throw new HttpException(
          `Invalid relation: ${relation}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    try {
      const session = await this._classesRepository.findOne({
        where: { id },
        relations,
      });

      if (!session) {
        throw new NotFoundException(`Class not found`);
      }

      return session;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Classes> {
    try {
      let instructors: Staff[] = [];
      const session = await this._classesRepository.findOne({
        where: { id },
      });

      if (!session) {
        throw new NotFoundException(`class not found`);
      }

      if (updateClassDto.staffIds && updateClassDto.staffIds.length > 0) {
        instructors = await this._staffRepository.find({
          where: { id: In(updateClassDto.staffIds) },
        });

        if (instructors.length !== updateClassDto.staffIds.length) {
          throw new NotFoundException(`One or more trainer not found`);
        }
      }

      session.instructors = instructors;

      this._classesRepository.merge(session, updateClassDto);

      await this._classesRepository.save(session);
      return session;
    } catch (error) {
      throw new Error(`Failed to update class: ${error.message}`);
    }
  }

  async updateClassFile(id: string, file: Express.Multer.File): Promise<any> {
    try {
      const session = await this._classesRepository.findOne({
        where: { id },
      });

      if (!session) {
        throw new NotFoundException(`Class not found`);
      }
      const oldPath = session.image;
      const newPath = file.path;
      const fileContent = readFileSync(file.path);
      writeFileSync(newPath, fileContent);

      session.image = newPath;
      unlinkSync(oldPath);
      return await this._classesRepository.save(session);
    } catch (error) {
      throw new Error(`Failed to update an image: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const session = await this._classesRepository.findOne({
        where: { id },
      });

      if (!session) {
        throw new NotFoundException(`Class not found`);
      }

      if (session.image) {
        try {
          unlinkSync(session.image); // Delete the image file from storage
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }

      // Remove the class entity from the database
      await this._classesRepository.delete(session.id);

      return {
        message: `Successfully deleted the class of: ${session.name}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to delete the class',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
