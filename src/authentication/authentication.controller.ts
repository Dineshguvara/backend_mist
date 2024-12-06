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

@Auth(AuthType.Bearer)
@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Auth(AuthType.None) // If you want this endpoint to be accessible without authentication
  @Post('register')
  @ApiCreatedResponse({ type: RegisterDto })
  register(
    @Query('token') token: string, // Retrieve the JWT token from the query parameter
    @Body() registerDto: RegisterDto,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required.');
    }

    // Pass the token and registration data to the authentication service
    return this.authenticationService.register(registerDto, token);
  }

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
