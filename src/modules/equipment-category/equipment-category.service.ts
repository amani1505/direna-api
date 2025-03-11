import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';
import { EquipmentCategory } from './entities/equipment-category.entity';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';

@Injectable()
export class EquipmentCategoryService {
  constructor(
    @InjectRepository(EquipmentCategory)
    private readonly _equipmentCategoryRepository: Repository<EquipmentCategory>,
  ) {}

  async create(
    createEquipmentCategoryDto: CreateEquipmentCategoryDto,
  ): Promise<EquipmentCategory> {
    try {
      const existingEquipmentCategory =
        await this._equipmentCategoryRepository.findOne({
          where: { category_name: createEquipmentCategoryDto.category_name },
        });

      if (existingEquipmentCategory) {
        throw new ConflictException(
          'equipment category with this name already exists',
        );
      }

      const equipmentCategory = this._equipmentCategoryRepository.create(
        createEquipmentCategoryDto,
      );

      equipmentCategory.image = createEquipmentCategoryDto.image;

      return await this._equipmentCategoryRepository.save(equipmentCategory);
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<EquipmentCategory> | EquipmentCategory[]> {
    try {
      const {
        relations = ['equipments'],
        sortBy = 'category_name',
        sortOrder = 'DESC',
      } = query;

      const queryBuilder =
        this._equipmentCategoryRepository.createQueryBuilder(
          'equipment_category',
        );

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === EquipmentCategory)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(
          `equipment_category.${relation}`,
          relation,
        );
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'equipment_category',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string, query: any): Promise<EquipmentCategory> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === EquipmentCategory)
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
      const category = await this._equipmentCategoryRepository.findOne({
        where: { id },
        relations,
      });

      if (!category) {
        throw new NotFoundException(`Equipment Category not found`);
      }

      return category;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(
    id: string,
    updateEquipmentCategoryDto: UpdateEquipmentCategoryDto,
  ): Promise<EquipmentCategory> {
    try {
      const category = await this._equipmentCategoryRepository.findOne({
        where: { id },
      });

      if (updateEquipmentCategoryDto.category_name) {
        const existingCategory =
          await this._equipmentCategoryRepository.findOne({
            where: { category_name: updateEquipmentCategoryDto.category_name },
          });

        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException(
            'Equipment Category with this name already exists',
          );
        }
      }

      Object.assign(category, updateEquipmentCategoryDto);
      return await this._equipmentCategoryRepository.save(category);
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async updateCategoryFile(
    id: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const category = await this._equipmentCategoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`category not found`);
      }
      const oldPath = category.image;
      const newPath = file.path;
      const fileContent = readFileSync(file.path);
      writeFileSync(newPath, fileContent);

      category.image = newPath;
      unlinkSync(oldPath);
      return await this._equipmentCategoryRepository.save(category);
    } catch (error) {
      throw new Error(`Failed to update an image: ${error.message}`);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const category = await this._equipmentCategoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.image) {
        try {
          unlinkSync(category.image);
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }

      // Remove the category entity from the database
      await this._equipmentCategoryRepository.remove(category);

      return {
        message: `Successfully deleted the category: ${category.category_name}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to delete the category',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
