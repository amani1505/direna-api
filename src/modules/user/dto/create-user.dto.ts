import { IsEmail, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  roleId: string;

  @IsString()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  staffId?: string;
}
