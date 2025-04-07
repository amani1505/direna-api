import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { Member } from '@modules/member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Member])],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
