import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailModule } from '@config/mail.module';
import { Files } from '../file/entities/file.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Blog } from '@modules/blog/entities/blog.entity';
import { UserSeeder } from '@seeder/user.seeder';
import { Role } from '@modules/roles/entities/role.entity';
import { Address } from '@modules/address/entities/address.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { GenerateUniqueNumberUtil } from '@utils/generate-unique-number.util';
import { Cart } from '@modules/cart/entities/cart.entity';
import { Wishlist } from '@modules/wishlist/entities/wishlist.entity';
import { Order } from '@modules/order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Files,
      Member,
      Staff,
      Blog,
      Role,
      Address,
      Branch,
      Service,
      Cart,
      Wishlist,
      Order,
    ]),
    MailModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserSeeder, GenerateUniqueNumberUtil],
  exports: [UserService, UserSeeder],
})
export class UserModule {}
