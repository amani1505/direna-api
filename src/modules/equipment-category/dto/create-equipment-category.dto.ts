import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEquipmentCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;
}
