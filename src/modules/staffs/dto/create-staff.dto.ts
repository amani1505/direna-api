import { GenderEnum } from '@enum/gender.enum';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  fullname: string;

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

  @IsString()
  address: string;

  @IsString()
  city: string;
}
