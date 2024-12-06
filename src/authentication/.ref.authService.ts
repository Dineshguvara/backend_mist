import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogInDto } from './dto/log-in.dto';
import { RequestOTPDto } from './dto/request-otp.dto';
import { ValidateOTP } from './dto/validate-otp.dto';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from './interfaces/active-userdata-interface';
import { randomUUID } from 'crypto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OtpService } from './otp.service';

export class InvalidateRefreshTokenError extends Error {}

// @Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly otpService: OtpService,
  ) {}

  async login(logInDto: LogInDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: logInDto.email,
      },
    });

    if (!user) {
      return new UnauthorizedException('User Not Found');
    }

    const isEqual = await this.hashingService.compare(
      logInDto.password,
      user.password,
    );

    if (!isEqual) {
      return new UnauthorizedException('Password Does Not Match');
    } else {
      const user = await this.prisma.user.findFirst({
        where: {
          email: logInDto.email,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      return await this.generateTokens(user);
    }
  }

  async requestOtp(requestOTPDto: RequestOTPDto) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        email: requestOTPDto.email,
      },
      select: {
        email: true,
      },
    });

    if (!employee) {
      return new NotFoundException('Employee Not Found');
    }

    const otpExist = await this.prisma.otp.findFirst({
      where: {
        email: requestOTPDto.email,
      },
    });

    if (otpExist) {
      await this.prisma.otp.deleteMany({
        where: { email: requestOTPDto.email },
      });
    }

    const mail = await this.otpService.sendOTP(
      String(requestOTPDto.email),
      Math.floor(100000 + Math.random() * 900000).toString(),
    );

    return { employee, mail };
  }

  async validateOtp(validateOTP: ValidateOTP) {
    const res = await this.otpService.validateOTP(
      String(validateOTP.email),
      validateOTP.otp,
    );
    const user = await this.prisma.employee.findFirst({
      where: {
        email: validateOTP.email,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        department: true,
        designation: true,
        countryCode: true,
        email: true,
        image: true,
        gradeId: true,
        employeeType: true,
        firstLogin: true,
        lastLogin: true,
        company: true,
        dateOfBirth: true,
        managerId: true,
      },
    });

    if (user === null) {
      return new NotFoundException('Employee Not Found');
    }

    if (res) {
      return await this.generateTokens(user);
    } else {
      return { suceess: false, message: 'OTP not Match' };
    }
  }

  async logout(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { suceess: false, message: 'Logout Successful' };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.prisma.user.findFirst({
        where: { id: sub },
      });

      const isValid = await this.findRefreshToken(user.id, refreshTokenId);

      if (isValid) {
        await this.prisma.refreshToken.deleteMany({
          where: {
            userId: user.id,
            refreshTokenId: refreshTokenId,
          },
        });
      } else {
        throw new Error('Refresh Token Is Invalidate');
        // return { suceess: false, message: "Refresh Token Is Invalidate" }
      }

      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }

      await this.prisma.refreshToken.deleteMany({
        where: { userId: refreshTokenDto.userId },
      });

      throw new UnauthorizedException();
    }
  }

  async findRefreshToken(id: number, tokenId: string) {
    const storedId = await this.prisma.refreshToken.findFirst({
      where: {
        userId: id,
        refreshTokenId: tokenId,
      },
    });

    if (storedId.refreshTokenId !== tokenId) {
      throw new InvalidateRefreshTokenError();
      // return { suceess: false, message: "Refesh Token Not Found" }
    }

    return storedId.refreshTokenId === tokenId;
  }

  async generateTokens(user: any) {
    const refreshTokenId = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          ...user,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, refreshTokenId },
    });

    return {
      access_token,
      refresh_token,
    };
  }

  private async signToken<T>(id: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: id,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
