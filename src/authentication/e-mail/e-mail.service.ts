import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EMailService {
  constructor(private readonly mailerService: MailerService) {}

  // ------------------------------------------------------------------
  //    SEND INVITATION THROUGH EMAIL
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  //     SEND OTP TO USER FOR REGISTRATION & PASSWORD RESET
  // ------------------------------------------------------------------
  async sendOTPEmail(email: string, emailMessage: string): Promise<void> {
    try {
      return await this.mailerService.sendMail({
        to: email,
        subject: 'One Time Password',
        template: 'otpmail',
        context: {
          message: emailMessage,
        },
      });
    } catch (error) {
      throw new Error(`Failed to send Invitation email: ${error}`);
    }
  }
}
