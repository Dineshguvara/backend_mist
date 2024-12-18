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
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  InvitationTokenDto,
  ResendOtpDto,
  ResetPasswordDto,
} from './dto/authentication.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorators';
import { ActiveUser } from './decorators/active-user.decorators';
import { Roles } from './decorators/roles/user-role.decorator';
import { RoleType } from './enums/role-type';
import { SuperAdminOnly } from './decorators/roles/super-admin-only.decoratot';
import { OtpService } from './otp/otp.service';

@Auth(AuthType.None)
@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly OtpService: OtpService,
  ) {}

  // ------------------------------------------------------------------
  //    LOGIN  CONTROLLER
  // ------------------------------------------------------------------

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiCreatedResponse({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    return this.authenticationService.login(loginDto);
  }

  // ------------------------------------------------------------------
  //    REGISTERING  CONTROLLER
  // ------------------------------------------------------------------

  // @Post('register/start/generate_otp')
  // async startRegistration(@Body() userDto: RegisterDto) {
  //   return this.authenticationService.startRegistration(userDto);
  // }

  // @Post('register/finish/verify_otp')
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

  // @Post('register/resend_otp')
  // @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
  // async resendOtp(@Body() dto: ResendOtpDto) {
  //   return this.authenticationService.resendOtp(dto);
  // }

  @Auth(AuthType.None) // If you want this endpoint to be accessible without authentication
  @Post('register')
  @ApiCreatedResponse({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto) {
    return this.authenticationService.register(registerDto);
  }

  // ------------------------------------------------------------------
  //    REFRESH TOKEN   CONTROLLER
  // ------------------------------------------------------------------

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @ApiCreatedResponse({ type: RefreshTokenDto })
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  // @SuperAdminOnly()
  @Roles(RoleType.Staff)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOkResponse()
  getProfile(@ActiveUser('sub') userId: number) {
    return { message: 'Access Token is valid!', userId };
  }

  // ------------------------------------------------------------------
  //    INVITE USER   CONTROLLER
  // ------------------------------------------------------------------
  @Auth(AuthType.Bearer)
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

  // ------------------------------------------------------------------
  //    LOGOUT USER  CONTROLLER
  // ------------------------------------------------------------------
  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiCreatedResponse()
  logout(@ActiveUser('sub') userId: number) {
    return this.authenticationService.logout(userId);
  }
}
