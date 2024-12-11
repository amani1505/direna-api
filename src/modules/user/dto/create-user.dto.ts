import { RoleEnum } from '@enum/role.enum';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
