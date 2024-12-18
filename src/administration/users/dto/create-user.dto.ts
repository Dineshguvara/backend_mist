import { IsString, IsEmail, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'schoolId must be a number' })
  schoolId?: number | null;
}
