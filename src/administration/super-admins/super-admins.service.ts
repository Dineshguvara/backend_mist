import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { SuperAdminEntity } from './entities/super-admin.entity';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

@Injectable()
export class SuperAdminsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // Lifecycle hook that runs when the module is initialized
  async onModuleInit() {
    await this.initiateSuperAdmin();
  }

  // This function will handle the creation of the super admin role and user
  private async initiateSuperAdmin() {
    try {
      // console.log('Checking for super admin role...');

      // 1. Check if the "super admin" role exists
      let superAdminRole = await this.prisma.role.findUnique({
        where: { name: 'super_admin' },
      });

      // console.log('Super Admin Role:', superAdminRole);

      // 2. Create the "super admin" role if it doesn't exist
      if (!superAdminRole) {
        // console.log('Creating super admin role...');
        superAdminRole = await this.prisma.role.create({
          data: { name: 'super_admin' },
        });
        // console.log('Super Admin Role Created:', superAdminRole);
      }

      // 3. Check if the super admin user exists
      let superAdminUser = await this.prisma.user.findUnique({
        where: { email: process.env.SUPER_ADMIN_EMAIL },
      });

      // 4. If user does not exist, create them with a hashed password
      if (!superAdminUser) {
        // console.log('Creating super admin user...');

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(
          process.env.SUPER_ADMIN_PASSWORD,
          10,
        );

        superAdminUser = await this.prisma.user.create({
          data: {
            email: process.env.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            roleId: superAdminRole.id,
            schoolId: null,
            approvalStatus: 'APPROVED',
          },
        });
        // console.log('Super Admin User Created:', superAdminUser);
      }

      // 5. Check if a record exists in the SuperAdmin table with this user's ID
      let superAdminRecord = await this.prisma.superAdmin.findUnique({
        where: { userId: superAdminUser.id },
      });

      // 6. Create or update the SuperAdmin entry
      if (!superAdminRecord) {
        await this.prisma.superAdmin.create({
          data: {
            userId: superAdminUser.id,
            name: process.env.SUPER_ADMIN_NAME,
          },
        });
        // console.log('Super Admin Record Created');
      } else if (superAdminRecord.name !== process.env.SUPER_ADMIN_NAME) {
        await this.prisma.superAdmin.update({
          where: { userId: superAdminUser.id },
          data: { name: process.env.SUPER_ADMIN_NAME },
        });
        // console.log('Super Admin Record Updated');
      }
    } catch (error) {
      console.error('Error setting up super admin:', error);
      throw error; // Or handle it as needed
    }
  }

  async findAllProfile(): Promise<SuperAdminEntity[]> {
    return this.prisma.superAdmin.findMany();
  }

  async getMyProfile(id: number): Promise<SuperAdminEntity | null> {
    return this.prisma.superAdmin.findUnique({
      where: { id: Number(id) },
    });
  }

  async updateMyProfile(
    id: number,
    updateSuperAdminDto: UpdateSuperAdminDto,
  ): Promise<SuperAdminEntity> {
    return this.prisma.superAdmin.update({
      where: { id: Number(id) },
      data: updateSuperAdminDto,
    });
  }
}
