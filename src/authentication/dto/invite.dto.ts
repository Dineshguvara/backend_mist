import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
