import { GenderEnum } from '@enum/gender.enum';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone_number: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsString()
  password?: string;

  @IsString()
  roleId: string;

  @IsString()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  staffId?: string;

  @IsOptional()
  @IsString()
  middle_name: string;
}
