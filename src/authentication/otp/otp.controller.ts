// import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
// import { OtpService } from './otp.service';
// import { GenerateOtpDto, VerifyOtpDto, ResendOtpDto } from '../dto/otp.dto';
// import { ApiResponse, ApiTags } from '@nestjs/swagger';
// import { Auth } from '../decorators/auth.decorators';
// import { AuthType } from '../enums/auth-type.enum';

// @Auth(AuthType.None)
// @Controller('otp')
// @ApiTags('otp')
// export class OtpController {
//   constructor(private otpService: OtpService) {}

//   @Post('generate')
//   @ApiResponse({ status: 201, description: 'OTP generated successfully.' })
//   async generateOtp(@Body() dto: GenerateOtpDto) {
//     const { otp, expiresAt } = await this.otpService.generateOtp(dto.email);

//     // For now, return OTP directly (for testing). Remove this in production.
//     return { message: 'OTP generated successfully', otp, expiresAt };
//   }

//   @Post('verify')
//   @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
//   async verifyOtp(@Body() dto: VerifyOtpDto) {
//     const isVerified = await this.otpService.verifyOtp(dto.email, dto.otp);
//     return { message: 'OTP verified successfully', isVerified };
//   }

//   @Post('resend')
//   @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
//   async resendOtp(@Body() dto: ResendOtpDto) {
//     const { otp, expiresAt } = await this.otpService.resendOtp(dto.email);
//     return { message: 'OTP resent successfully', otp, expiresAt };
//   }
// }
