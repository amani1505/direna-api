import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartModule } from '@modules/cart/cart.module';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Equipment]),
    CartModule,
    UtilsModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
