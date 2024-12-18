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
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  InvitationTokenDto,
  ResendOtpDto,
  ResetPasswordDto,
} from './dto/authentication.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/administration/users/users.service';
import { EMailService } from './e-mail/e-mail.service';
import * as jwt from 'jsonwebtoken'; // Ensure jwt package is installed and imported
import { RoleHelperService } from './helper/role-helper.service';
import { TokenHelperService } from './helper/token-helper.service';
import { OtpService } from './otp/otp.service';
import { OtpPurpose } from '@prisma/client';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EMailService,
    private readonly roleHelperService: RoleHelperService,
    private readonly tokenHelperService: TokenHelperService,
    private readonly OtpService: OtpService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  // ------------------------------------------------------------------
  //    REGISTERING NEW USER
  // ------------------------------------------------------------------

  async register(
    userDto: RegisterDto,
  ): Promise<{ userId: number; accessToken: string; refreshToken: string }> {
    try {
      const { name, email, password, schoolId, roleId } = userDto;

      if (!schoolId) {
        throw new BadRequestException(
          'School ID is required for registration.',
        );
      }

      // Create a new user
      const user = await this.userService.createUser({
        email: email,
        password: password,
        roleId,
        schoolId,
      });

      // find role using id
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID ${roleId} does not exist`);
      }

      // Perform role-based actions
      await this.roleHelperService.createRoleBasedRecord(
        user.id,
        role.name,
        name,
      );

      // Generate and return tokens
      const tokens = await this.tokenHelperService.generateTokens(user);
      console.log('from register function backend', tokens);
      return tokens;
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

  // async startRegistration(userDto: RegisterDto): Promise<{ message: string }> {
  //   try {
  //     const { email } = userDto;

  //     // Check if the email is already in use
  //     const existingUser = await this.userService.findUserByEmail(email);
  //     if (existingUser) {
  //       throw new BadRequestException('Email is already registered.');
  //     }

  //     // Generate OTP with a purpose and send it to the user's email
  //     await this.OtpService.generateOtp(email, OtpPurpose.REGISTRATION);

  //     return {
  //       message: 'OTP has been sent to your email. Please verify to proceed.',
  //     };
  //   } catch (error) {
  //     console.error('Error during registration initiation:', error);

  //     // Throw a generic internal server error if needed
  //     throw new InternalServerErrorException(
  //       'Error during registration initiation.',
  //     );
  //   }
  // }

  // async completeRegistration(
  //   email: string,
  //   otp: string,
  //   userDto: RegisterDto,
  // ): Promise<{ userId: number; accessToken: string; refreshToken: string }> {
  //   try {
  //     // Verify the OTP
  //     const isOtpValid = await this.OtpService.verifyOtp(
  //       email,
  //       otp,
  //       OtpPurpose.REGISTRATION,
  //     );
  //     if (!isOtpValid) {
  //       throw new BadRequestException('Invalid or expired OTP.');
  //     }

  //     const { name, password, schoolId, roleId } = userDto;

  //     if (!schoolId) {
  //       throw new BadRequestException(
  //         'School ID is required for registration.',
  //       );
  //     }

  //     // Create a new user
  //     const user = await this.userService.createUser({
  //       email: email,
  //       password: password,
  //       roleId,
  //       schoolId,
  //     });

  //     // find role using id
  //     const role = await this.prisma.role.findUnique({
  //       where: { id: roleId },
  //     });

  //     if (!role) {
  //       throw new Error(`Role with ID ${roleId} does not exist`);
  //     }

  //     // Perform role-based actions
  //     await this.roleHelperService.createRoleBasedRecord(
  //       user.id,
  //       role.name,
  //       name,
  //     );

  //     // Delete all OTPs related to this email
  //     await this.OtpService.deleteOtpByEmail(email, OtpPurpose.REGISTRATION);

  //     // Generate and return tokens
  //     const tokens = await this.tokenHelperService.generateTokens(user);

  //     return tokens;
  //   } catch (error) {
  //     console.error('Error during registration completion:', error);

  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }

  //     // Throw a generic internal server error if needed
  //     throw new InternalServerErrorException(
  //       'Error during registration completion.',
  //     );
  //   }
  // }

  // async resendOtp(dto: ResendOtpDto) {
  //   try {
  //     const { otp, expiresAt } = await this.OtpService.resendOtp(
  //       dto.email,
  //       dto.purpose,
  //     );
  //     return { message: 'OTP resent successfully', otp, expiresAt };
  //   } catch (error) {
  //     const err = error as Error;
  //     console.error(`Error creating role: ${err.message}`);
  //     throw new InternalServerErrorException('Failed to create role');
  //   }
  // }

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

    // Generate tokens and include user ID in the response
    return await this.tokenHelperService.generateTokens(user);

    // return {
    //   user: { id: user.id, email: user.email, role: user.role },
    //   ...tokens,
    // };
  }

  // ------------------------------------------------------------------
  //   REFRESH TOKEN FUNCTION
  // ------------------------------------------------------------------

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Decode the refresh token to extract refreshTokenId
      const decoded = jwt.verify(refreshToken, this.jwtConfiguration.secret);
      const { refreshTokenId } = decoded as { refreshTokenId: string };

      if (!refreshTokenId) {
        console.error('Refresh token ID is missing in the payload.');
        return false; // Frontend should handle logout
      }

      // Check if the refresh token exists in the database
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: { refreshTokenId },
      });

      if (!tokenRecord) {
        console.error('Refresh token not found in the database.');
        return false; // Frontend should handle logout
      }

      // Check if the refresh token has expired
      if (tokenRecord.expiresAt < new Date()) {
        console.error('Refresh token has expired. Invalidating token.');
        await this.tokenHelperService.removeRefreshToken(refreshTokenId);
        return false; // Frontend should handle logout
      }

      // If token is valid and not expired, fetch user and generate new tokens
      const user = await this.prisma.user.findUnique({
        where: { id: tokenRecord.userId },
        include: { role: true },
      });

      if (!user) {
        console.error('User associated with the refresh token does not exist.');
        return false; // Frontend should handle logout
      }

      // Invalidate the current refresh token
      await this.tokenHelperService.removeRefreshToken(refreshTokenId);

      // Generate and return new tokens
      return await this.tokenHelperService.generateTokens(user);
    } catch (error) {
      console.error('Error decoding or processing refresh token:', error);
      return false; // Frontend should handle logout
    }
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

    // Generate the invitation token
    const token = await this.tokenHelperService.generateInvitationToken(
      roleId,
      schoolId,
    );

    // Construct the invitation link
    const invitationLink = `${process.env.APP_REGISTER_PAGE_URL}/authentication/register?token=${token}`;

    // Send the email
    await this.emailService.sendInviEmail(
      toEmail,
      roleId,
      schoolId,
      invitationLink,
    );

    return { invitationLink };
  }

  // ------------------------------------------------------------------
  //   HELPER FUNCTIONS
  // -----------------------------------------------------------------

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
