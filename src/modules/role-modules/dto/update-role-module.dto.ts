import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleModuleDto } from './create-role-module.dto';

export class UpdateRoleModuleDto extends PartialType(CreateRoleModuleDto) {}
