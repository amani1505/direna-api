import { IsNumber, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  equipmentId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
