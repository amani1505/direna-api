import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserService } from '@modules/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { User } from '@modules/user/entities/user.entity';
import { MailModule } from '@config/mail.module';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';
import { Files } from '@modules/file/entities/file.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      User,
      Branch,
      Service,
      Files,
      Role,
      Staff,
    ]),
    MailModule,
    UtilsModule,
  ],
  controllers: [MemberController],
  providers: [MemberService, UserService],
})
export class MemberModule {}
