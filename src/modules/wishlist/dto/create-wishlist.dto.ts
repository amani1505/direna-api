import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsUUID()
  equipment_id: string;
}
