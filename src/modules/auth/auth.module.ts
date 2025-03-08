import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshJwtStrategy } from './strategy/refresh-token.strategy';
import { User } from '@modules/user/entities/user.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { MailModule } from '@config/mail.module';

@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: {
        expiresIn: '3600s',
      },
    }),
    TypeOrmModule.forFeature([User, Member, Staff]),
    MailModule,
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    LocalStrategy,
    RefreshJwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
