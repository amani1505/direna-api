import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Max,
  IsOptional
} from 'class-validator';
import { ParseNumber, ParsePrice, SanitizeHTML, Trim } from '@lib/transformer';
export class CreateEquipmentDto {
  @Length(3, 100)
  @Trim()
  @SanitizeHTML()
  @IsString()
  title: string;

  @Length(0, 400)
  @Trim()
  @SanitizeHTML()
  @IsString()
  description: string;

  @IsOptional()
  isPublished?: boolean;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  serial_number: string;
  
  @IsNotEmpty()
  @IsString()
  status:string;
  
    @IsNotEmpty()
  @IsString()
  used_for:string;

  @IsNotEmpty()
  @IsString()
  purchase_date: string;

  @ParsePrice()
  @Max(9999999999)
  @IsPositive()
  @IsNumber()
  @ParseNumber()
  price: number;

  @IsInt()
  @IsPositive()
  @IsNumber()
  @ParseNumber()
  quantity: number;

  @IsArray()
  @IsNotEmpty()
  equipmentCategoryIds: Array<string>;
}
