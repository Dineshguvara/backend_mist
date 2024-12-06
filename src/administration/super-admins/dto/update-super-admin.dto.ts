import { IsString, IsEmail, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSuperAdminDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
}
