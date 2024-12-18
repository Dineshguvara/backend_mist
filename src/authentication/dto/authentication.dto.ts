import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Length,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { OtpPurpose } from '@prisma/client';

// ------------------------------------------------------------------
//     RESET PASSWORD DTO
// ------------------------------------------------------------------
export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  //   @MinLength(6)
  @IsString()
  password: string;
}

// ------------------------------------------------------------------
//    INVITATION TOKEN DTO
// ------------------------------------------------------------------
export class InvitationTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty()
  @IsNotEmpty()
  schoolId: number;

  @ApiProperty()
  @IsString()
  toEmail: string;
}

// ------------------------------------------------------------------
//    LOGIN DTO
// ------------------------------------------------------------------

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ------------------------------------------------------------------
//     GENERATE OTP DTO
// ------------------------------------------------------------------
export class GenerateOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for OTP generation',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty()
  @IsEnum(OtpPurpose)
  @IsNotEmpty()
  purpose: OtpPurpose;
}

// ------------------------------------------------------------------
//     VERIFY OTP DTO
// ------------------------------------------------------------------
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

  @ApiProperty()
  @IsEnum(OtpPurpose)
  @IsNotEmpty()
  purpose: OtpPurpose;
}

// ------------------------------------------------------------------
//    RESEND OTP DTO
// ------------------------------------------------------------------
export class ResendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to resend OTP',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty()
  @IsEnum(OtpPurpose)
  @IsNotEmpty()
  purpose: OtpPurpose;
}

// ------------------------------------------------------------------
//    REFRESH TOKEN DTO
// ------------------------------------------------------------------
export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

// ------------------------------------------------------------------
//    REGISTER DTO
// ------------------------------------------------------------------
export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  // @ApiProperty({ enum: OtpPurpose })
  // @IsEnum(OtpPurpose)
  // @IsNotEmpty()
  // purpose: OtpPurpose;
}

// ------------------------------------------------------------------
//    CREATE REQUEST APPROVAL DTO
// ------------------------------------------------------------------
export class CreateApprovalRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

// ------------------------------------------------------------------
//    UPDATE APPROVAL DTO
// ------------------------------------------------------------------
export class UpdateApprovalRequestDto {
  status: 'APPROVED' | 'REJECTED';
}
