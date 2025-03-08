import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleActionDto } from './dto/create-role-action.dto';
import { UpdateRoleActionDto } from './dto/update-role-action.dto';
import { RoleAction } from './entities/role-action.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { handleDuplicateError } from '@utils/handle-duplicate-error.util';

@Injectable()
export class RoleActionsService {
  constructor(
    @InjectRepository(RoleAction)
    private _roleActionRepository: Repository<RoleAction>,
  ) {}

  async create(createRoleActionDto: CreateRoleActionDto): Promise<RoleAction> {
    try {
      const roleAction = this._roleActionRepository.create(createRoleActionDto);
      return await this._roleActionRepository.save(roleAction);
    } catch (error) {
      handleDuplicateError(error, 'Role Action');
    }
  }

  async findAll(): Promise<RoleAction[]> {
    try {
      return await this._roleActionRepository.find();
    } catch (error) {
      throw new Error(`Failed to fetch role actions: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<RoleAction> {
    try {
      const roleAction = await this._roleActionRepository.findOne({
        where: { id },
      });
      if (!roleAction) {
        throw new NotFoundException(`RoleAction with ID ${id} not found`);
      }
      return roleAction;
    } catch (error) {
      throw new Error(`Failed to fetch role action: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateRoleActionDto: UpdateRoleActionDto,
  ): Promise<RoleAction> {
    try {
      const roleAction = await this.findOne(id);
      Object.assign(roleAction, updateRoleActionDto);
      return await this._roleActionRepository.save(roleAction);
    } catch (error) {
      handleDuplicateError(error, 'Role Action');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this._roleActionRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`RoleAction with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete role action: ${error.message}`);
    }
  }
}
