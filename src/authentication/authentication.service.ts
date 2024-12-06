import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { RoleEntity } from 'src/administration/roles/entities/role.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/administration/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { InvitationTokenDto } from './dto/invite.dto';
import * as nodemailer from 'nodemailer';
import { MailInvitationService } from './invitation_mail.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailInviService: MailInvitationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  // ------------------------------------------------------------------
  //    REGISTERING NEW USER
  // ------------------------------------------------------------------
  async register(
    userDto: RegisterDto,
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Decode the token and extract data
      const decodedToken = token ? this.decodeToken(token) : null;

      // Extract roleId and schoolId
      const roleId = decodedToken?.roleId;
      const schoolId = decodedToken?.schoolId;

      if (!schoolId) {
        throw new BadRequestException(
          'School ID is required for registration.',
        );
      }

      // Create a new user
      const user = await this.userService.createUser({
        email: userDto.email,
        password: userDto.password,
        roleId,
      });

      // Perform role-based actions
      await this.createRoleBasedRecord(user.id, roleId, schoolId, userDto.name);

      // Generate and return tokens
      return await this.generateTokens(user);
    } catch (error) {
      console.error('Error during registration:', error);

      // Handle specific errors
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Throw generic internal server error if needed
      throw new InternalServerErrorException('Error during user registration.');
    }
  }

  // ------------------------------------------------------------------
  //   LOGIN FUNCTION
  // ------------------------------------------------------------------
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: loginDto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password does not match');
    }

    return await this.generateTokens(user);
  }

  // ------------------------------------------------------------------
  //   REFRESH TOKEN FUNCTION
  // ------------------------------------------------------------------
  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { refreshTokenId: refreshToken },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { role: true },
    });

    await this.invalidateRefreshToken(refreshToken);
    return await this.generateTokens(user);
  }

  // ------------------------------------------------------------------
  //   LOGOUT FUNCTION
  // ------------------------------------------------------------------
  async logout(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Verify user existence
      await this.userService.findUserById(userId);

      // Delete refresh tokens for this user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        message: 'Logout successful.',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: 'User not found. Logout failed.',
        };
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  // ------------------------------------------------------------------
  //  INVITE USER FOR REGISTRATION
  // ------------------------------------------------------------------
  async inviteUser(invitationTokenDto: InvitationTokenDto, userId: number) {
    const { roleId, schoolId, toEmail } = invitationTokenDto;

    if (!roleId || !schoolId || !toEmail) {
      throw new BadRequestException(
        'Role ID, School ID, and recipient email are required',
      );
    }

    // const inviter = await this.userService.findUserById(userId);
    // if (!inviter || !inviter.) {
    //   throw new BadRequestException('Inviter email not found');
    // }

    // const fromEmail = inviter.name;

    // Generate the invitation token
    const token = await this.generateInvitationToken(roleId, schoolId);

    // Construct the invitation link
    const invitationLink = `${process.env.APP_REGISTER_PAGE_URL}/authentication/register?token=${token}`;

    // Send the email
    await this.mailInviService.sendInviEmail(
      toEmail,
      roleId,
      schoolId,
      invitationLink,
    );

    return { invitationLink };
  }

  // ------------------------------------------------------------------
  //   HELPER FUNCTIONS
  // ------------------------------------------------------------------
  // Helper to  role Base creation while register an new user
  private async createRoleBasedRecord(
    userId: number,
    roleId: number,
    schoolId: number,
    name: string,
  ): Promise<void> {
    try {
      // Fetch the role by roleId to get the role name
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID ${roleId} does not exist`);
      }

      // Switch based on role name and create the corresponding record
      switch (role.name.toLowerCase()) {
        case 'super_admin':
          await this.prisma.superAdmin.create({
            data: {
              userId,
              name,
            },
          });
          break;

        case 'admin':
          await this.prisma.admin.create({
            data: {
              userId,
              name,
              schoolId,
            },
          });
          break;

        case 'principal':
          await this.prisma.principal.create({
            data: {
              userId,
              name,
              schoolId,
            },
          });
          break;

        case 'staff':
          await this.prisma.staff.create({
            data: {
              userId,
              name,
              schoolId,
            },
          });
          break;

        case 'student':
          await this.prisma.student.create({
            data: {
              userId,
              name,
              schoolId,
            },
          });
          break;

        default:
          throw new Error(`Role "${role.name}" is not supported`);
      }
    } catch (error) {
      console.error('Error during role-based record creation:', error);
      throw new InternalServerErrorException(
        'Failed to create role-specific record',
      );
    }
  }

  // Helper to  generate acccess and refresh token
  private async generateTokens(user: User & { role: RoleEntity }) {
    const refreshTokenId = randomUUID();

    const accessToken = await this.signToken(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      { email: user.email, roleId: user.role.id, roleName: user.role.name },
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

    return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
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

  // Helper to check refesh token is validor or not
  private async invalidateRefreshToken(refreshTokenId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { refreshTokenId },
    });
  }

  // Helper to generate invitation token
  private async generateInvitationToken(
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

  // Helper to decode token
  private decodeToken(
    token: string,
  ): { roleId: number; schoolId: number } | null {
    try {
      return this.jwtService.decode(token) as {
        roleId: number;
        schoolId: number;
      };
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  // Helper to fetch the default student role ID
  private async getDefaultStudentRoleId(): Promise<number> {
    const studentRole = await this.prisma.role.findUnique({
      where: { name: 'student' },
    });

    if (!studentRole) {
      throw new Error('Student role is not defined in the database.');
    }

    return studentRole.id;
  }
}
