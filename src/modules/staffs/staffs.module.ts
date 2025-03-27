import { forwardRef, Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { MailModule } from '@config/mail.module';
import { Member } from '@modules/member/entities/member.entity';
import { Classes } from '@modules/classes/entities/class.entity';
import { UtilsModule } from '@utils/utils.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, User, Branch, Role, Member, Classes]),
    MailModule,
    UtilsModule,
    forwardRef(() => UserModule),
  ],
  controllers: [StaffsController],
  providers: [StaffsService],
})
export class StaffsModule {}
