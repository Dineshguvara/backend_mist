import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class GenerateOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for OTP generation',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address used to generate OTP',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: '123456', description: 'The 6-digit OTP to verify' })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to resend OTP',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
