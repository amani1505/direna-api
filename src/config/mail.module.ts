import { MailService } from '@modules/mail/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as fs from 'fs';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const templateDir = join(process.cwd(), 'src', 'templates', 'email');

        // Verify template directory exists
        if (!fs.existsSync(templateDir)) {
          console.error(`Template directory does not exist: ${templateDir}`);
        }

        return {
          transport: {
            host: configService.get('MAIL_HOST'),
            port: configService.get('MAIL_PORT'),
            auth: {
              user: configService.get('MAIL_USERNAME'),
              pass: configService.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"Direna Health Support" <${configService.get('MAIL_USERNAME')}>`,
          },
          // template: {
          //   dir: templateDir,
          //   adapter: new HandlebarsAdapter(),
          //   options: {
          //     strict: true,
          //   },
          // },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
