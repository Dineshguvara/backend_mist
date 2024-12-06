import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Token to be sent in the invitation link' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'Email address of the sender' })
  @IsNotEmpty()
  @IsEmail()
  fromEmail: string;

  @ApiProperty({ description: 'Email address of the recipient' })
  @IsNotEmpty()
  @IsEmail()
  toEmail: string;
}
