import { Module } from '@nestjs/common';
 
import { MailerModule } from '@nestjs-modules/mailer'; // Example mailer module import
import { MailController } from './e-mail.controller';
import { MailService } from './e-mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: +process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
