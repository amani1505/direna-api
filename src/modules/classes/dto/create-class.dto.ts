import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
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

  @IsInt()
  @IsPositive()
  @IsNumber()
  @ParseNumber()
  capacity: number;

  image: string;
}
