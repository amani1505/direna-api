import { IsEmail, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  fullname: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  phone?: string;

  address?: string;

  city?: string;

  age?: number;

  weight?: number;

  height?: number;

  goal?: string;
}
