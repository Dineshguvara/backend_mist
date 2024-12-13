import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthenticationService } from './authentication.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { REQUEST_USER_KEY } from './authentication.constants';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorators';
import { RegisterDto } from './dto/register.dto';
import { ActiveUser } from './decorators/active-user.decorators';
import { InvitationTokenDto } from './dto/invite.dto';
import { Roles } from './decorators/roles/user-role.decorator';
import { RoleType } from './enums/role-type';
import { SuperAdminOnly } from './decorators/roles/super-admin-only.decoratot';
import { OtpService } from './otp/otp.service';
import { ResendOtpDto } from './dto/otp.dto';

@Auth(AuthType.Bearer)
@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly OtpService: OtpService,
  ) {}

  @Auth(AuthType.None) // If you want this endpoint to be accessible without authentication
  @Post('register')
  @ApiCreatedResponse({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto) {
    return this.authenticationService.register(registerDto);
  }

  // @Auth(AuthType.None)
  // @Post('register/start')
  // async startRegistration(@Body() userDto: RegisterDto) {
  //   return this.authenticationService.startRegistration(userDto);
  // }
  
  // @Auth(AuthType.None)
  // @Post('register/complete')
  // async completeRegistration(
  //   @Body()
  //   {
  //     email,
  //     otp,
  //     userDto,
  //   }: {
  //     email: string;
  //     otp: string;
  //     userDto: RegisterDto;
  //   },
  // ) {
  //   return this.authenticationService.completeRegistration(email, otp, userDto);
  // }

  // @Auth(AuthType.None)
  // @Post('register/resend-otp')
  // @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
  // async resendOtp(@Body() dto: ResendOtpDto) {
  //    const { otp, expiresAt } = await this.OtpService.resendOtp(dto.email);
  //    return { message: 'OTP resent successfully', otp, expiresAt };
  // }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiCreatedResponse({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @ApiCreatedResponse({ type: RefreshTokenDto })
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }

  // @SuperAdminOnly()
  @Roles(RoleType.Staff)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOkResponse()
  getProfile(@ActiveUser('sub') userId: number) {
    return { message: 'Access Token is valid!', userId };
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('invite-user')
  @SuperAdminOnly()
  @ApiCreatedResponse({ type: InvitationTokenDto })
  invitaion(
    @ActiveUser('sub') userId: number,
    @Body() invitationTokenDto: InvitationTokenDto,
  ) {
    return this.authenticationService.inviteUser(invitationTokenDto, userId);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiCreatedResponse()
  logout(@ActiveUser('sub') userId: number) {
    return this.authenticationService.logout(userId);
  }
}
