import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<UserEntity & { role: RoleEntity }> {
    try {
      const { email, password, roleId } = createUserDto;

      // Check if the email is already in use
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId,
        },
        include: { role: true },
      });

      return user;
    } catch (error) {
      const err = error as Error;
      console.error('Error creating user:', err.message);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Get all users
  async findAllUser(): Promise<UserEntity[]> {
    try {
      return await this.prisma.user.findMany({
        include: {
          role: true, // Include role information in the result
        },
      });
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching users: ${err.message}`);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  // Get a specific user by ID
  async findUserById(
    id: number,
  ): Promise<UserEntity & { role: { name: string } }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { role: true }, // Include the role relation
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  // Find a specific user by email
  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.warn(`User with email ${email} not found`); // Log for debugging
        return null; // Return null instead of throwing an exception
      }

      return user; // Return the full user object, not just the email
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching user with email ${email}:`, err.message);
      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  // Update a specific user by ID
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Update the user
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      const err = error as Error;
      console.error(`Error updating user with ID ${id}: ${err.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // Delete a specific user by ID
  async remove(id: number): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      const err = error as Error;
      console.error(`Error deleting user with ID ${id}: ${err.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
