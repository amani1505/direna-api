import { IsBoolean, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip_code: string;

  @IsString()
  country: string;

  @IsString()
  type: string;

  @IsBoolean()
  is_default: boolean;
}
