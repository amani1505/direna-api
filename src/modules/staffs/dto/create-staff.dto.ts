import { GenderEnum } from '@enum/gender.enum';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  branchId?: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsString()
  role: string;

  @IsString()
  phone: string;
}
