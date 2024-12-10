import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private _mailerService: MailerService) {}

  async sendMail(to: string, subject: string, text: string) {
    await this._mailerService.sendMail({
      to,
      subject,
      text,
    });
  }
}
