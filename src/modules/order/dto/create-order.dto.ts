import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;
}
