import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleModuleDto } from './dto/create-role-module.dto';
import { UpdateRoleModuleDto } from './dto/update-role-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleModule } from './entities/role-module.entity';
import { Repository } from 'typeorm';
import { handleDuplicateError } from '@utils/handle-duplicate-error.util';

@Injectable()
export class RoleModulesService {
  constructor(
    @InjectRepository(RoleModule)
    private _roleModuleRepository: Repository<RoleModule>,
  ) {}

  async create(createRoleModuleDto: CreateRoleModuleDto): Promise<RoleModule> {
    try {
      const roleModule = this._roleModuleRepository.create(createRoleModuleDto);
      return await this._roleModuleRepository.save(roleModule);
    } catch (error) {
      handleDuplicateError(error, 'Role Module');
    }
  }

  async findAll(): Promise<RoleModule[]> {
    try {
      return await this._roleModuleRepository.find({
        relations: ['role_actions'],
      });
    } catch (error) {
      throw new Error(`Failed to fetch role modules: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<RoleModule> {
    try {
      const roleModule = await this._roleModuleRepository.findOne({
        where: { id },
      });
      if (!roleModule) {
        throw new NotFoundException(`RoleModule with ID ${id} not found`);
      }
      return roleModule;
    } catch (error) {
      throw new Error(`Failed to fetch role module: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateRoleModuleDto: UpdateRoleModuleDto,
  ): Promise<RoleModule> {
    try {
      const roleModule = await this.findOne(id);
      Object.assign(roleModule, updateRoleModuleDto);
      return await this._roleModuleRepository.save(roleModule);
    } catch (error) {
      handleDuplicateError(error, 'Role Module');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this._roleModuleRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`RoleModule with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete role module: ${error.message}`);
    }
  }
}
