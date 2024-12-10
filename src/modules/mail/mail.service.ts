import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private _mailerService: MailerService) {}

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this._mailerService.sendMail({
        to,
        subject,
        text,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
