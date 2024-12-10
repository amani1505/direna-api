import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserService } from '@modules/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { User } from '@modules/user/entities/user.entity';
import { MailModule } from '@config/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User]), MailModule],
  controllers: [MemberController],
  providers: [MemberService, UserService],
})
export class MemberModule {}
