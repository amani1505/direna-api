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
import { Not, Repository } from 'typeorm';

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

  async findAll(): Promise<Role[]> {
    return await this._roleRepository.find();
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
  async findOne(id: string): Promise<Role> {
    try {
      const role = await this._roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      return role;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.findOne(id);

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
      throw new Error(`Failed to update branch: ${error.message}`);
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
        message: `Successfully delete the branch at: ${role.name}`,
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
