import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import {
  GenerateOtpDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../dto/authentication.dto';
import { OtpPurpose } from '@prisma/client';
import { UsersService } from 'src/administration/users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class ForgetPasswordService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private usersService: UsersService,
  ) {}

  // ------------------------------------------------------------------
  //    GENERATE OTP  FOR FORGET PASSWORD CONTROLLER
  // ------------------------------------------------------------------

  // Generate OTP
  async generateOtp(dto: GenerateOtpDto) {
    try {
      // Check if the email exists
      const user = await this.usersService.findUserByEmail(dto.email);
      if (!user) {
        throw new BadRequestException('Entered email ID is invalid');
      }

      const { otp, expiresAt } = await this.otpService.generateOtp(
        dto.email,
        dto.purpose,
      );

      // Return OTP for testing purposes (remove in production)
      return { message: 'OTP generated successfully', otp, expiresAt };
    } catch (error) {
      const err = error as Error;
      console.error(`Error Generating OTP: ${err.message}`);
      throw new InternalServerErrorException('Failed to Generate OTP');
    }
  }
  // ------------------------------------------------------------------
  //    VERIFY OTP  FOR FORGET PASSWORD CONTROLLER
  // ------------------------------------------------------------------

  // Verify OTP
  async verifyOtp(dto: VerifyOtpDto) {
    try {
      // Check if the email exists
      const user = await this.usersService.findUserByEmail(dto.email);
      if (!user) {
        throw new BadRequestException('Entered email ID is invalid');
      }

      const isVerified = await this.otpService.verifyOtp(
        dto.email,
        dto.otp,
        dto.purpose,
      );

      if (isVerified) {
        await this.otpService.deleteOtpByEmail(
          dto.email,
          OtpPurpose.FORGET_PASSWORD,
        );
      }

      return { message: 'OTP verified successfully', isVerified };
    } catch (error) {
      const err = error as Error;
      console.error(`Error Verifying OTP: ${err.message}`);
      throw new InternalServerErrorException('Failed to Verify OTP');
    }
  }
  // ------------------------------------------------------------------
  //    RESEND OTP  FOR FORGET PASSWORD CONTROLLER
  // ------------------------------------------------------------------

  // Resend OTP
  async resendOtp(dto: ResendOtpDto) {
    try {
      // Check if the email exists
      const user = await this.usersService.findUserByEmail(dto.email);
      if (!user) {
        throw new BadRequestException('Entered email ID is invalid');
      }

      const { otp, expiresAt } = await this.otpService.resendOtp(
        dto.email,
        dto.purpose,
      );

      return { message: 'OTP resent successfully', otp, expiresAt };
    } catch (error) {
      const err = error as Error;
      console.error(`Error Resending OTP: ${err.message}`);
      throw new InternalServerErrorException('Failed to Resend OTP');
    }
  }

  // ------------------------------------------------------------------
  //   FORGET PASSWORD
  // ------------------------------------------------------------------

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.usersService.updatePassword(user);
  }
}
