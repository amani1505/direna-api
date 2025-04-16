import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private _cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private _cartItemRepository: Repository<CartItem>,
    @InjectRepository(Equipment)
    private _equipmentRepository: Repository<Equipment>,
  ) {}

  async getCart(user?: User): Promise<Cart> {
    try {
      let cart: Cart;

      if (user) {
        cart = await this._cartRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['items', 'items.equipment', 'items.equipment.files'],
        });

        if (!cart) {
          cart = this._cartRepository.create({ user });
          await this._cartRepository.save(cart);
        }
      } else {
        cart = this._cartRepository.create();
        await this._cartRepository.save(cart);
      }

      return cart;
    } catch (error) {
      throw new InternalServerErrorException(`Error fetching cart: ${error}`);
    }
  }

  async addToCart(cartId: string, addToCartDto: CreateCartDto): Promise<Cart> {
    try {
      const { equipmentId, quantity } = addToCartDto;
      const cart = await this._cartRepository.findOne({
        where: { id: cartId },
        relations: ['items', 'items.equipment'],
      });

      if (!cart) throw new NotFoundException('Cart not found');

      const equipment = await this._equipmentRepository.findOne({
        where: { id: equipmentId },
      });

      if (!equipment) throw new NotFoundException('Equipment not found');
      if (equipment.quantity < quantity)
        throw new BadRequestException('Insufficient stock available');

      let cartItem = cart.items.find(
        (item) => item.equipment.id === equipmentId,
      );

      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        cartItem = this._cartItemRepository.create({
          cart,
          equipment,
          quantity,
        });
        cart.items.push(cartItem);
      }

      await this._cartItemRepository.save(cartItem);
      return this._cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.equipment', 'items.equipment.files'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error adding item to cart: ${error.message}`,
      );
    }
  }

  async updateCartItem(
    cartId: string,
    itemId: string,
    updateCartItemDto: UpdateCartDto,
  ): Promise<Cart> {
    try {
      const cart = await this._cartRepository.findOne({
        where: { id: cartId },
        relations: ['items', 'items.equipment'],
      });

      if (!cart) throw new NotFoundException('Cart not found');
      const cartItem = cart.items.find((item) => item.id === itemId);
      if (!cartItem) throw new NotFoundException('Cart item not found');

      const equipment = await this._equipmentRepository.findOne({
        where: { id: cartItem.equipment.id },
      });

      if (equipment.quantity < updateCartItemDto.quantity)
        throw new BadRequestException('Insufficient stock available');

      cartItem.quantity = updateCartItemDto.quantity;
      await this._cartItemRepository.save(cartItem);

      return this._cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.equipment', 'items.equipment.files'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating cart item: ${error}`,
      );
    }
  }

  async removeCartItem(cartId: string, itemId: string): Promise<Cart> {
    try {
      const cart = await this._cartRepository.findOne({
        where: { id: cartId },
        relations: ['items'],
      });

      if (!cart) throw new NotFoundException('Cart not found');
      const cartItem = cart.items.find((item) => item.id === itemId);
      if (!cartItem) throw new NotFoundException('Cart item not found');

      await this._cartItemRepository.remove(cartItem);
      return this._cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.equipment', 'items.equipment.files'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error removing cart item: ${error}`,
      );
    }
  }

  async clearCart(cartId: string): Promise<void> {
    try {
      const cart = await this._cartRepository.findOne({
        where: { id: cartId },
        relations: ['items'],
      });

      if (!cart) throw new NotFoundException('Cart not found');
      await this._cartItemRepository.remove(cart.items);
    } catch (error) {
      throw new InternalServerErrorException(`Error clearing cart: ${error}`);
    }
  }
}
