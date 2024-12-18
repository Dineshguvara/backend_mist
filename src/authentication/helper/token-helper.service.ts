import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the path as needed
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { RoleEntity } from 'src/administration/roles/entities/role.entity';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
@Injectable()
export class TokenHelperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  // ------------------------------------------------------------------
  //    GENERATE ACCESS & REFRESH TOKENS
  // ------------------------------------------------------------------
  async generateTokens(user: User & { role: RoleEntity }) {
    const refreshTokenId = randomUUID();

    const accessToken = await this.signToken(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      { email: user.email, roleId: user.role.id, roleName: user.role.name, schoolId : user.schoolId, approvalStatus: user.approvalStatus  },
    );

    const refreshToken = await this.signToken(
      user.id,
      this.jwtConfiguration.refreshTokenTtl,
      { refreshTokenId },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        refreshTokenId,
        expiresAt: new Date(
          Date.now() + this.jwtConfiguration.refreshTokenTtl * 1000,
        ),
      },
    });

    return { userId: user.id, accessToken, refreshToken };
  }

  // ------------------------------------------------------------------
  //     SET TOKEN SOME ENCRYTED DATA FOR SECURITY
  // ------------------------------------------------------------------
  async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  // ------------------------------------------------------------------
  //     DELETE REFRESH TOKEN AFTER SUCCESSFULL LOGIN
  // ------------------------------------------------------------------
  async removeRefreshToken(refreshTokenId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { refreshTokenId },
    });
  }

  // ------------------------------------------------------------------
  //     GENERATE INVITE TOKEN FOR REGISTRATION PURPOSE
  // ------------------------------------------------------------------
  async generateInvitationToken(
    roleId: number,
    schoolId: number,
  ): Promise<string> {
    try {
      // Generate a token with the provided roleId and schoolId
      const token = await this.signToken(
        null, // No userId since the user doesn't exist yet
        this.jwtConfiguration.invitationTokenTtl,
        { roleId, schoolId },
      );

      return token;
    } catch (error) {
      console.error('Error generating invitation token:', error);
      throw new InternalServerErrorException(
        'Failed to generate invitation token',
      );
    }
  }
}
