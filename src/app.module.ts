import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MemberModule } from './modules/member/member.module';
import { ServicesModule } from './modules/services/services.module';
import { BranchesModule } from './modules/branches/branches.module';
import { BranchSeeder } from './seeding/branch.seeder';
import { UserModule } from './modules/user/user.module';
// import { MailModule } from '@config/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),

    DatabaseModule,
    MemberModule,
    ServicesModule,
    BranchesModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly _branchSeeder: BranchSeeder) {}
  onModuleInit() {
    this._branchSeeder.seed();
  }
}
