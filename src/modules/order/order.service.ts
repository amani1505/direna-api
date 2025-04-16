import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Connection, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { CartService } from '@modules/cart/cart.service';
import { User } from '@modules/user/entities/user.entity';
import { Cart } from '@modules/cart/entities/cart.entity';
import { GenerateUniqueNumberUtil } from '@utils/generate-unique-number.util';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private _orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private _orderItemRepository: Repository<OrderItem>,
    private _cartService: CartService,
    private _connection: Connection,

    private readonly _generateUniqueNumberUtil: GenerateUniqueNumberUtil,
  ) {}

  async createOrder(
    user: User,
    cartId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const queryRunner = this._connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this._connection.getRepository(Cart).findOne({
        where: { id: cartId },
        relations: ['items', 'items.equipment'],
      });
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const orderNumber =
        await this._generateUniqueNumberUtil.generateUniqueNumber(
          'DIRENA-ORD',
          this._orderRepository,
          'order_number',
        );
      const order = this._orderRepository.create({
        user,
        ...createOrderDto,
        order_number: orderNumber,
        status: OrderStatus.PENDING,
        total_amount: 0,
      });
      const savedOrder = await queryRunner.manager.save(order);

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        const equipment = await queryRunner.manager.findOne(Equipment, {
          where: { id: cartItem.equipment.id },
        });
        if (!equipment) {
          throw new NotFoundException(
            `Equipment with ID ${cartItem.equipment.id} not found`,
          );
        }
        if (equipment.quantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for equipment: ${equipment.title}`,
          );
        }

        const orderItem = this._orderItemRepository.create({
          order: savedOrder,
          equipment,
          quantity: cartItem.quantity,
          price: equipment.price,
        });

        orderItems.push(orderItem);
        totalAmount += equipment.price * cartItem.quantity;
        equipment.quantity -= cartItem.quantity;
        await queryRunner.manager.save(equipment);
      }

      await queryRunner.manager.save(orderItems);

      savedOrder.total_amount = totalAmount;
      await queryRunner.manager.save(savedOrder);
      await this._cartService.clearCart(cartId);
      await queryRunner.commitTransaction();

      return this._orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.equipment'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error processing order: ${error}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return this._orderRepository.find({
        where: { user: { id: userId } },
        relations: ['items', 'items.equipment', 'items.equipment.files'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user orders: ${error}`,
      );
    }
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    try {
      const order = await this._orderRepository.findOne({
        where: { id: orderId, user: { id: userId } },
        relations: ['items', 'items.equipment'],
      });
      if (!order) throw new NotFoundException('Order not found');
      return order;
    } catch (error) {
      throw new InternalServerErrorException(`Error fetching order: ${error}`);
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    try {
      const order = await this._orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) throw new NotFoundException('Order not found');
      order.status = status;
      return this._orderRepository.save(order);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating order status: ${error}`,
      );
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const order = await this._orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) throw new NotFoundException('Order not found');
      await this._orderRepository.remove(order);
    } catch (error) {
      throw new InternalServerErrorException(`Error deleting order: ${error}`);
    }
  }
}
