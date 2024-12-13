import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EMailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInviEmail(
    toEmail: string,
    roleId: number,
    schoolId: number,
    invitationLink: string,
  ): Promise<void> {
    try {
      return await this.mailerService.sendMail({
        to: toEmail,
        subject: 'Invitation for Registration',
        template: 'invitationmail',
        context: {
          link: invitationLink,
          role: roleId,
          school: schoolId,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send Invitation email: ${error}`);
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      return await this.mailerService.sendMail({
        to: email,
        subject: 'OTP for Registration',
        template: 'otpmail',
        context: {
          otp: otp,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send Invitation email: ${error}`);
    }
  }
}
