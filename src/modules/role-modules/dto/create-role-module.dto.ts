import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRoleModuleDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
