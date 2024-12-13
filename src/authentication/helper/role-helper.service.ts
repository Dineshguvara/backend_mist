import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the path to your Prisma service

@Injectable()
export class RoleHelperService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoleBasedRecord(
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
}
