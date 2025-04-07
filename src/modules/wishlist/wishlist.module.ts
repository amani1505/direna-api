import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { User } from '@modules/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Equipment, User])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
