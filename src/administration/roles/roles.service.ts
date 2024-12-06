import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Create a new role
  async createRole(
    userId: number,
    createRoleDto: CreateRoleDto,
  ): Promise<RoleEntity> {
    try {
      // Check if the role name already exists
      const existingRole = await this.prisma.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }

      // Create the role with the `createdBy` field
      const newRole = await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
          createdBy: userId, // Assign the active user ID
        } as Prisma.RoleUncheckedCreateInput,
      });

      return newRole;
    } catch (error) {
      const err = error as Error;
      console.error(`Error creating role: ${err.message}`);
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  // Get all roles
  async findAllRoles(): Promise<RoleEntity[]> {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching roles: ${err.message}`);
      throw new InternalServerErrorException('Failed to fetch roles');
    }
  }

  // Get a specific role by ID
  async findOneRole(id: number): Promise<RoleEntity | null> {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      return role;
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching role with ID ${id}: ${err.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch role');
    }
  }

  // Update a specific role by ID
  async updateRole(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    try {
      // Check if the role exists before updating
      const existingRole = await this.prisma.role.findUnique({ where: { id } });
      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
    } catch (error) {
      const err = error as Error;
      console.error(`Error updating role with ID ${id}: ${err.message}`);
      if (error instanceof NotFoundException) throw error;
      // if (error.code === 'P2002') {
      //   // Prisma unique constraint error
      //   throw new ConflictException('Role with this name already exists');
      // }
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  // Delete a specific role by ID
  async deleteRole(id: number): Promise<RoleEntity> {
    try {
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return await this.prisma.role.delete({ where: { id } });
    } catch (error) {
      const err = error as Error;
      console.error(`Error deleting role with ID ${id}: ${err.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete role');
    }
  }
}
