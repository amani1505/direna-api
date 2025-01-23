import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { getMetadataArgsStorage, Not, Repository } from 'typeorm';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly _roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const existingRole = await this._roleRepository.findOne({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }

      const role = this._roleRepository.create(createRoleDto);
      return await this._roleRepository.save(role);
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Role> | Role[]> {
    try {
      const { relations = [], sortBy = 'name', sortOrder = 'DESC' } = query;

      const queryBuilder = this._roleRepository.createQueryBuilder('roles');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Role)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`roles.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'roles',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  async findAllExceptUser(): Promise<Role[]> {
    try {
      // const roles = await this._roleRepository.find({
      //   where: {
      //     name: 'user',
      //   },
      // });

      return await this._roleRepository.find({
        where: { name: Not('user') },
      });
    } catch (error) {
      throw new NotFoundException(
        `No roles found except user : ${error.message}`,
      );
    }
  }
  async findOne(id: string, query: any): Promise<Role> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Role)
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
      const role = await this._roleRepository.findOne({
        where: { id },
        relations,
      });

      if (!role) {
        throw new NotFoundException(`Equipment Category not found`);
      }

      return role;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this._roleRepository.findOne({ where: { id } });

      if (updateRoleDto.name) {
        const existingRole = await this._roleRepository.findOne({
          where: { name: updateRoleDto.name },
        });

        if (existingRole && existingRole.id !== id) {
          throw new ConflictException('Role with this name already exists');
        }
      }

      Object.assign(role, updateRoleDto);
      return await this._roleRepository.save(role);
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const role = await this._roleRepository.findOne({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException('role not found');
      }

      await this._roleRepository.remove(role);

      return {
        message: `Successfully delete the role at: ${role.name}`,
        status: 'success',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to delete the Role',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
