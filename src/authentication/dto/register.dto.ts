import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

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
}
