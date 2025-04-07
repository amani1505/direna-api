import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  // @IsNotEmpty()
  shipping_address?: string;

  @IsOptional()
  @IsString()
  // @IsNotEmpty()
  payment_method?: string;
}
