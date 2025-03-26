import { GenderEnum } from '@enum/gender.enum';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  branchId: string;

  @IsArray()
  serviceIds: Array<string>;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
