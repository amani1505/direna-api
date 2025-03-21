import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateCartDto {
  @IsString()
  equipmentId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
