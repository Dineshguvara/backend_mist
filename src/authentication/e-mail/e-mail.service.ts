import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer'; // Assume you're using a mailer module
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  // ------------------------------------------------------------------
  //        SEND INVITATION TOKEN THROUGH EMAIL
  // ------------------------------------------------------------------
  async sendInviEmail(sendEmailDto: SendEmailDto) {
    const { token, fromEmail, toEmail } = sendEmailDto;

    if (!token || !fromEmail || !toEmail) {
      throw new BadRequestException(
        'Token, From email, and To email are required',
      );
    }

    // Delegate to MailService for sending the email
    return this.sendInvitationEmail(sendEmailDto);
  }

  // ------------------------------------------------------------------
  //   HELPER FUNCTIONS
  // ------------------------------------------------------------------

  private async sendInvitationEmail(
    sendEmailDto: SendEmailDto,
  ): Promise<{ message: string }> {
    const { token, fromEmail, toEmail } = sendEmailDto;

    const invitationLink = `${process.env.APP_REGISTER_PAGE_URL}/register?token=${token}`;

    try {
      await this.mailerService.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: 'You are invited!',
        text: `You have been invited to join. Use this link to register: ${invitationLink}`,
        html: `<p>You have been invited to join. Use this link to register:</p><a href="${invitationLink}">${invitationLink}</a>`,
      });

      return { message: 'Invitation email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }
}
