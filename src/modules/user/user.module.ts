import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailModule } from '@config/mail.module';
import { Files } from '../file/entities/file.entity';
import { Member } from '@modules/member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Files, Member]), MailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
