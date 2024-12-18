import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OtpService } from '../otp/otp.service';
import {
  GenerateOtpDto,
  VerifyOtpDto,
  ResendOtpDto,
  ResetPasswordDto,
} from '../dto/authentication.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../decorators/auth.decorators';
import { AuthType } from '../enums/auth-type.enum';
import { ForgetPasswordService } from './forget-password.service';


@Auth(AuthType.None)
@Controller('forget-password')
@ApiTags('forget-password')
export class ForgetPasswordController {
  constructor(
    private otpService: OtpService,
    private forgetPasswordService: ForgetPasswordService,
  ) {}

  // ------------------------------------------------------------------
  //    GENERATE OTP  FOR FORGET PASSWORD CONTROLLER
  // ------------------------------------------------------------------

  @Post('start/generate_otp')
  @ApiResponse({ status: 201, description: 'OTP generated successfully.' })
  async createOtp(@Body() dto: GenerateOtpDto) {
    return this.forgetPasswordService.generateOtp(dto);
  }

  // ------------------------------------------------------------------
  //    VERIFY OTP CONTROLLER
  // ------------------------------------------------------------------

  @Post('finish/verify_otp')
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.forgetPasswordService.verifyOtp(dto);
  }

  // ------------------------------------------------------------------
  //    RESEND OTP CONTROLLER
  // ------------------------------------------------------------------

  @Post('resend_otp')
  @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.forgetPasswordService.resendOtp(dto);
  }

  // ------------------------------------------------------------------
  //   FORGET PASSWORD  CONTROLLER
  // ------------------------------------------------------------------
  @Post('update/complete')
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.forgetPasswordService.resetPassword(dto.email, dto.password);
    return { message: 'Password reset successfully' };
  }
}
