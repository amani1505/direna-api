import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  zip_code: string;

  @IsString()
  district: string;

  @IsString()
  country: string;

  @IsString()
  type: string;

  @IsBoolean()
  is_default: boolean;
}
