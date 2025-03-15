import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';
// import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly _ordersService: OrderService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('cart/:cartId')
  async createOrder(
    @Request() req,
    @Param('cartId') cartId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this._ordersService.createOrder(req.user, cartId, createOrderDto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  async getUserOrders(@Request() req) {
    return this._ordersService.getUserOrders(req.user.id);
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this._ordersService.getOrderById(req.user.id, id);
  }

  // @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this._ordersService.updateOrderStatus(id, status);
  }
}
