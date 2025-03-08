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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Files, Member, Staff, Blog, Role]),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserSeeder],
  exports: [UserService, UserSeeder],
})
export class UserModule {}
