import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
// import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private _wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Equipment)
    private _equipmentRepository: Repository<Equipment>,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
  ) {}
  async create(
    createWishlistDto: CreateWishlistDto,
    userId: string,
  ): Promise<Wishlist> {
    try {
      // Check if equipment exists
      const equipment = await this._equipmentRepository.findOne({
        where: { id: createWishlistDto.equipment_id },
      });

      if (!equipment) {
        throw new NotFoundException(
          `Equipment with ID ${createWishlistDto.equipment_id} not found`,
        );
      }

      // Check if user exists
      const user = await this._userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Create new wishlist entry
      const wishlist = new Wishlist();

      wishlist.equipment = equipment;
      wishlist.user = user;

      return this._wishlistRepository.create(wishlist);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create wishlist item: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Wishlist[]> {
    try {
      return await this._wishlistRepository.find({
        relations: ['equipment', 'equipment.files', 'user'],
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve wishlist items: ${error.message}`,
      );
    }
  }

  async findAllMyWishlist(uderId: string): Promise<Wishlist[]> {
    try {
      return await this._wishlistRepository.find({
        where: { user: { id: uderId } },
        relations: ['equipment', 'equipment.files', 'user'],
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve wishlist items: ${error.message}`,
      );
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} wishlist`;
  // }

  // update(id: number, updateWishlistDto: UpdateWishlistDto) {
  //   return `This action updates a #${id} wishlist`;
  // }

  async remove(id: string): Promise<void> {
    try {
      const wishlist = await this._wishlistRepository.findOne({
        where: { id },
      });
      if (!wishlist) {
        throw new NotFoundException(`Wishlist item with ID ${id} not found`);
      }

      await this._wishlistRepository.remove(wishlist);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete wishlist item: ${error.message}`,
      );
    }
  }
}
