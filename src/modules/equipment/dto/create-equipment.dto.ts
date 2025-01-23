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

  @IsNotEmpty()
  @IsBoolean()
  isPublished: boolean;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  serial_number: string;

  @IsNotEmpty()
  @IsString()
  purchase_date: string;

  @ParsePrice()
  @Max(999999)
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
