import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto, VerifyOtpDto, ResendOtpDto } from '../dto/authentication.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../decorators/auth.decorators';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('otp')
@ApiTags('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  // ------------------------------------------------------------------
  //    GENERATE OTP CONTROLLER
  // ------------------------------------------------------------------
  @Auth(AuthType.None)
  @Post('generate')
  @ApiResponse({ status: 201, description: 'OTP generated successfully.' })
  async generateOtp(@Body() dto: GenerateOtpDto) {

    
    const { otp, expiresAt } = await this.otpService.generateOtp(
      dto.email,
      dto.purpose,
    );

    // For now, return OTP directly (for testing). Remove this in production.
    return { message: 'OTP generated successfully', otp, expiresAt };
  }

  // ------------------------------------------------------------------
  //    VERIFY OTP CONTROLLER
  // ------------------------------------------------------------------
  @Auth(AuthType.None)
  @Post('verify')
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isVerified = await this.otpService.verifyOtp(
      dto.email,
      dto.otp,
      dto.purpose,
    );
    return { message: 'OTP verified successfully', isVerified };
  }

  // ------------------------------------------------------------------
  //    RESEND OTP CONTROLLER
  // ------------------------------------------------------------------
  @Auth(AuthType.None)
  @Post('resend')
  @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    const { otp, expiresAt } = await this.otpService.resendOtp(
      dto.email,
      dto.purpose,
    );
    return { message: 'OTP resent successfully', otp, expiresAt };
  }
}
