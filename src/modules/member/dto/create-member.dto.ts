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
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  branchId?: string;

  @IsArray()
  serviceIds: Array<string>;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  age?: number;


  @IsString()
  weight: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  goal?: string;
}
