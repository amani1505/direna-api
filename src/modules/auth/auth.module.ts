import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshJwtStrategy } from './strategy/refresh-token.strategy';
import { User } from '@modules/user/entities/user.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { MailModule } from '@config/mail.module';
import { PassportModule } from '@nestjs/passport';

import { config } from 'dotenv';
import { Role } from '@modules/roles/entities/role.entity';
import { RolesService } from '@modules/roles/roles.service';
import { SessionSerializer } from './serializer/session.serializer';
import { UserModule } from '@modules/user/user.module';

config();
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '3600s',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    TypeOrmModule.forFeature([User, Member, Staff, Role]),
    MailModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RefreshJwtStrategy,
    RolesService,
    SessionSerializer,
  ],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
