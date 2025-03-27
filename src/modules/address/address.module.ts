import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { User } from '@modules/user/entities/user.entity';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User]), AuthModule],
  exports: [AddressService],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
