import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import { EMailService } from '../e-mail/e-mail.service';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private readonly emailService: EMailService,
  ) {}

  // ------------------------------------------------------------------
  //    GENERATE OTP & SAVE IN OTP TABLE, SEND EMAIL ALSO
  // ------------------------------------------------------------------
  async generateOtp(email: string): Promise<{ otp: string; expiresAt: Date }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    await this.prisma.otp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send the email
    await this.emailService.sendOTPEmail(email, otp);

    return { otp, expiresAt };
  }

  // ------------------------------------------------------------------
  //   VERIFY OTP
  // ------------------------------------------------------------------
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpEntry = await this.prisma.otp.findFirst({
      where: { email, otp, isUsed: false },
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
  async resendOtp(email: string): Promise<{ otp: string; expiresAt: Date }> {
    // Mark any previous unused OTPs for this email as used
    await this.prisma.otp.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true },
    });

    // Generate and return a new OTP
    return this.generateOtp(email);
  }

  // ------------------------------------------------------------------
  //     DELETE OTP USING EMAIL
  // ------------------------------------------------------------------
  async deleteOtpByEmail(email: string): Promise<void> {
    console.log('Email for OTP deletion:', email); // Debugging log
    await this.prisma.otp.deleteMany({
      where: { email },
    });
  }
}
