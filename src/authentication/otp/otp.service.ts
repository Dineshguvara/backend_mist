import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import { EMailService } from '../e-mail/e-mail.service';
import { OtpPurpose } from '@prisma/client';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private readonly emailService: EMailService,
  ) {}

  // ------------------------------------------------------------------
  //    GENERATE OTP & SAVE IN OTP TABLE, SEND EMAIL ALSO
  // ------------------------------------------------------------------
  async generateOtp(
    email: string,
    purpose: OtpPurpose,
  ): Promise<{ otp: string; expiresAt: Date }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 1.5 * 60 * 1000); // OTP expires in 1.5 minutes

    await this.prisma.otp.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
      },
    });

    const emailMessage =
      purpose === OtpPurpose.REGISTRATION
        ? `Your registration OTP is ${otp}. It is valid for 1.5 minutes.`
        : `Your password reset OTP is ${otp}. It is valid for 1.5 minutes.`;

    // Send the email
    await this.emailService.sendOTPEmail(email, emailMessage);

    return { otp, expiresAt };
  }

  // ------------------------------------------------------------------
  //   VERIFY OTP
  // ------------------------------------------------------------------
  async verifyOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<boolean> {
    const otpEntry = await this.prisma.otp.findFirst({
      where: { email, otp, purpose, isUsed: false },
    });

    if (!otpEntry) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpEntry.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otpEntry.id },
      data: { isUsed: true },
    });

    return true;
  }

  // ------------------------------------------------------------------
  //   RESEND OTP
  // ------------------------------------------------------------------
  async resendOtp(
    email: string,
    purpose: OtpPurpose,
  ): Promise<{ otp: string; expiresAt: Date }> {
    // Mark any previous unused OTPs for this email as used
    await this.prisma.otp.updateMany({
      where: { email, purpose, isUsed: false },
      data: { isUsed: true },
    });

    // Generate and return a new OTP
    return this.generateOtp(email, purpose);
  }

  // ------------------------------------------------------------------
  //     DELETE OTP USING EMAIL
  // ------------------------------------------------------------------
  async deleteOtpByEmail(email: string, purpose: OtpPurpose): Promise<void> {
 

    const whereClause: any = { email };

    if (purpose) {
      whereClause.purpose = purpose;
    }

    await this.prisma.otp.deleteMany({
      where: whereClause,
    });
  }
}
