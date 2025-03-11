import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getMetadataArgsStorage, In, Repository } from 'typeorm';
import { Equipment } from './entities/equipment.entity';
import { Files } from '@modules/file/entities/file.entity';
import { EquipmentCategory } from '@modules/equipment-category/entities/equipment-category.entity';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private _equipmentRepository: Repository<Equipment>,
    @InjectRepository(Files)
    private _fileRepository: Repository<Files>,
    @InjectRepository(EquipmentCategory)
    private _equipmentCategoryRepository: Repository<EquipmentCategory>,
  ) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    files: Array<Express.Multer.File>,
  ): Promise<Equipment> {
    try {
      const { equipmentCategoryIds, ...equipmentData } = createEquipmentDto;

      const categories = await this._equipmentCategoryRepository.find({
        where: {
          id: In(equipmentCategoryIds),
        },
      });

      if (categories.length !== categories.length) {
        throw new NotFoundException(`One or more equipment category not found`);
      }

      const createdEquipment = this._equipmentRepository.create({
        ...equipmentData,
        categories,
      });

      const savedEquipment =
        await this._equipmentRepository.save(createdEquipment);

      const images = files.map((file) => {
        const image = new Files();
        image.file_name = file.filename;
        image.file_path = file.path;
        image.equipment = savedEquipment;
        return image;
      });
      await this._fileRepository.save(images);

      return savedEquipment;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Equipment> | Equipment[]> {
    try {
      const {
        relations = [],
        sortBy = 'title',
        sortOrder = 'ASC',
        filterBy,
        search,
      } = query;

      const queryBuilder =
        this._equipmentRepository.createQueryBuilder('equipment');

      // Get valid relations for the Equipment entity
      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Equipment)
        .map((relation) => relation.propertyName);

      // Add requested relations to the query
      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`equipment.${relation}`, relation);
      });

      // Create a copy of the query object to modify
      const modifiedQuery = { ...query, sortBy, sortOrder };

      // Handle category_name filtering separately
      if (filterBy === 'category' && search) {
        // Join the categories table if not already joined
        if (!relations.includes('categories')) {
          queryBuilder.leftJoin('equipment.categories', 'categories');
        }

        // Apply the category name filter directly
        queryBuilder.andWhere('categories.category_name = :categoryName', {
          categoryName: search,
        });

        // Remove the filter and search from the modified query
        // to prevent applyFiltersAndPagination from trying to apply it again
        delete modifiedQuery.filterBy;
        delete modifiedQuery.search;
      }

      // Apply other filters and pagination
      return applyFiltersAndPagination(
        queryBuilder,
        modifiedQuery,
        validRelations,
        'equipment',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string, query: any): Promise<Equipment> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Equipment)
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
      const equipment = await this._equipmentRepository.findOne({
        where: { id },
        relations,
      });

      if (!equipment) {
        throw new NotFoundException(`Equipment not found`);
      }

      return equipment;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(
    id: string,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    try {
      let categories: EquipmentCategory[] = [];

      const equipment = await this._equipmentRepository.findOne({
        where: { id },
      });

      if (!equipment) {
        throw new NotFoundException(`equipment not found`);
      }

      if (
        updateEquipmentDto.equipmentCategoryIds &&
        updateEquipmentDto.equipmentCategoryIds.length > 0
      ) {
        categories = await this._equipmentCategoryRepository.find({
          where: { id: In(updateEquipmentDto.equipmentCategoryIds) },
        });

        if (
          categories.length !== updateEquipmentDto.equipmentCategoryIds.length
        ) {
          throw new NotFoundException(
            `One or more equipment category not found`,
          );
        }
      }

      equipment.categories = categories;

      this._equipmentRepository.merge(equipment, updateEquipmentDto);

      await this._equipmentRepository.save(equipment);
      return equipment;
    } catch (error) {
      throw new Error(`Failed to update equipment: ${error.message}`);
    }
  }

  async uploadEquipmentImage(
    equipmentId: string,
    file: Express.Multer.File,
  ): Promise<Files> {
    try {
      const equipment = await this._equipmentRepository.findOne({
        where: { id: equipmentId },
      });

      if (!equipment) {
        throw new NotFoundException(`equipment not found`);
      }
      const image = new Files();
      image.file_name = file.filename;
      image.file_path = file.path;
      image.equipment = equipment;
      return image;
    } catch (error) {
      throw new HttpException(
        `Failed to upload!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateEquipmentImage(
    imageId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const image = await this._fileRepository.findOne({
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundException(`image not found`);
      }
      const oldPath = image.file_path;
      const newPath = file.path;
      const fileContent = readFileSync(file.path);
      writeFileSync(newPath, fileContent);
      image.file_name = file.filename;
      image.file_path = newPath;
      unlinkSync(oldPath);
      return await this._fileRepository.save(image);
    } catch (error) {
      throw new Error(`Failed to update an image: ${error.message}`);
    }
  }

  async deleteEquipmentImage(imageId: string): Promise<any> {
    try {
      const image = await this._fileRepository.findOne({
        where: { id: imageId },
      });

      const equipment = await this._equipmentRepository.findOne({
        where: { id: image.equipment.id },
      });

      if (equipment.files.length <= 1) {
        throw new BadRequestException("you can't delete any more");
      }

      await this._fileRepository.delete(imageId);
      unlinkSync(image.file_path);
      return {
        message: `successfull remove a file with file name ${image.file_name}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to delete the equipment image',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async remove(id: string) {
    try {
      const equipment = await this._equipmentRepository.findOne({
        where: { id },
        relations: ['files'],
      });

      if (!equipment) {
        throw new NotFoundException(`Equipment not found`);
      }

      for (const file of equipment.files) {
        try {
          unlinkSync(file.file_path);
          await this._fileRepository.delete(file.id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new HttpException(
            {
              message: 'Failed to delete the equipment image',
              error: error.message || 'Internal Server Error',
              status: 'error',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      await this._equipmentRepository.delete(id);

      return {
        message: `Successfully removed equipment with name ${equipment.title}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to delete the equipment',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
