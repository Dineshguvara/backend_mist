import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';
import { RolesService } from 'src/administration/roles/roles.service';
import { UsersService } from 'src/administration/users/users.service';
import { RolesGuard } from './guards/role/user-role.guard';
import { EMailService } from './e-mail/e-mail.service';
import { RoleHelperService } from './helper/role-helper.service';
import { TokenHelperService } from './helper/token-helper.service';
import { OtpService } from './otp/otp.service';
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Role-based access control
    },
    AccessTokenGuard,
    AuthenticationService,
    RolesService,
    UsersService,
    EMailService,
    RoleHelperService,
    TokenHelperService,
    OtpService,
    // {
    //   provide: HashingService,
    //   useClass: BcryptService,
    // },
  ],
  controllers: [AuthenticationController],
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
})
export class AuthenticationModule {}
