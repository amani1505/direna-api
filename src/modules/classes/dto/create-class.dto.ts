import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ParseNumber } from '@lib/transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsPositive()
  @IsNumber()
  @ParseNumber()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsArray()
  staffIds: Array<string>;

  image: string;
}
