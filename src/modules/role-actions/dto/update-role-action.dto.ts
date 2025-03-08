import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleActionDto } from './create-role-action.dto';

export class UpdateRoleActionDto extends PartialType(CreateRoleActionDto) {}
