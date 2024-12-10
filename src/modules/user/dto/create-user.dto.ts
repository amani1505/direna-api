import { RoleEnum } from '@enum/role.enum';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
