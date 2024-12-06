import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SchoolService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // Create a new school
  async createSchool(userId: number, createSchoolDto: CreateSchoolDto) {
    try {
      const newSchool = await this.prisma.school.create({
        data: {
          ...createSchoolDto,
          imageUrl: createSchoolDto.imageUrl, // Include the uploaded file's URL
          createdBy: userId, // Include the creator's user ID
        } as Prisma.SchoolUncheckedCreateInput,
      });
      console.log(' from service file  Body:', createSchoolDto);

      return newSchool;
    } catch (error) {
      console.error(`Error creating school: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to create school');
    }
  }

  async findAllSchool() {
    try {
      // Get the base URL from the environment variables or default to localhost
      const baseUrl =
        this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      console.log('Base URL:', baseUrl);

      // Fetch all schools from the database
      const schools = await this.prisma.school.findMany();

      // Map and format the imageUrl for each school
      return schools.map((school) => ({
        ...school,
        imageUrl: school.imageUrl
          ? school.imageUrl.startsWith('http')
            ? school.imageUrl // If fully qualified URL, leave it as is
            : `${baseUrl}${school.imageUrl}` // Prefix relative paths with baseUrl
          : null, // If imageUrl is null or undefined, keep it as null
      }));
    } catch (error) {
      console.error(`Error retrieving schools: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to retrieve schools');
    }
  }

  // Retrieve a single school by ID
  async findOneSchool(id: number) {
    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      return school;
    } catch (error) {
      console.error(`Error retrieving school: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to retrieve the school');
    }
  }

  // Update a school by ID
  async updateSchool(id: number, updateSchoolDto: UpdateSchoolDto) {
    try {
      const data = updateSchoolDto.imageUrl
        ? updateSchoolDto
        : { ...updateSchoolDto, imageUrl: undefined };

      const updatedSchool = await this.prisma.school.update({
        where: { id },
        data: data,
      });

      return updatedSchool;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }
      console.error(`Error updating school: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to update the school');
    }
  }

  // Delete a school by ID
  async deleteSchool(id: number) {
    try {
      const deletedSchool = await this.prisma.school.delete({
        where: { id },
      });

      return deletedSchool;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }
      console.error(`Error deleting school: ${(error as Error).message}`);
      throw new InternalServerErrorException('Failed to delete the school');
    }
  }
}
