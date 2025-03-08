import { Optional } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRoleActionDto {
  @IsString()
  module_id: string;

  @IsString()
  action: string;

  @IsString()
  display_name: string;

  @IsString()
  display_group: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @Optional()
  isAllowed: boolean;
}
