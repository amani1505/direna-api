import { Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { Role } from '@modules/roles/entities/role.entity';
import { MailModule } from '@config/mail.module';
import { Member } from '@modules/member/entities/member.entity';
import { Classes } from '@modules/classes/entities/class.entity';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, User, Branch, Role, Member, Classes]),
    MailModule,
    UtilsModule,
  ],
  controllers: [StaffsController],
  providers: [StaffsService, UserService],
})
export class StaffsModule {}
