import { IsString, IsEmail, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
}
