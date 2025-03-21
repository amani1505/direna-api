import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { SessionGuard } from '@modules/auth/guard/session.guard';

@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this._cartService.getCart(req.user);
  }

  @Post(':cartId/items')
  async addToCart(
    @Param('cartId') cartId: string,
    @Body() addToCartDto: CreateCartDto,
  ) {
    return this._cartService.addToCart(cartId, addToCartDto);
  }

  @Put(':cartId/items/:itemId')
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartDto,
  ) {
    return this._cartService.updateCartItem(cartId, itemId, updateCartItemDto);
  }

  @Delete(':cartId/items/:itemId')
  async removeCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this._cartService.removeCartItem(cartId, itemId);
  }

  @Delete(':cartId')
  async clearCart(@Param('cartId') cartId: string) {
    return this._cartService.clearCart(cartId);
  }
}
