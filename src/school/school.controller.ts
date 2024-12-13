import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { UpdateSchoolDto } from './dto/update-school.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/authentication/decorators/auth.decorators';
import { AuthType } from 'src/authentication/enums/auth-type.enum';
import { ActiveUser } from 'src/authentication/decorators/active-user.decorators';
import { CreateSchoolDto } from './dto/create-school.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request as ExpressRequest } from 'express';

@Auth(AuthType.Bearer)
@ApiBearerAuth()
@ApiTags('school')
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new School' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: CreateSchoolDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/school-images', // Save files locally

        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new Error('Only JPG and PNG files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createSchool(
    @ActiveUser('sub') userId: number,
    @Body() createSchoolDto: CreateSchoolDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/school-images/${file.filename}` : null;

    return this.schoolService.createSchool(userId, {
      ...createSchoolDto,
      imageUrl,
    });
  }

  @Get()
  findAllSchool() {
    return this.schoolService.findAllSchool();
  }

  @Auth(AuthType.None)
  @Get('school-register')
  showAllSchool() {
    return this.schoolService.findAllSchool();
  }

  @Get(':id')
  findOneSchool(@Param('id') id: string) {
    return this.schoolService.findOneSchool(+id);
  }

  @Auth(AuthType.None)
  @Get('school-register/:id')
  showOneSchool(@Param('id') id: string) {
    return this.schoolService.findOneSchool(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a School with Image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/school-images',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new Error('Only JPG and PNG files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateSchool(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/school-images/${file.filename}` : null;
    return this.schoolService.updateSchool(+id, {
      ...updateSchoolDto,
      imageUrl,
    });
  }

  @Delete(':id')
  deleteSchool(@Param('id') id: string) {
    return this.schoolService.deleteSchool(+id);
  }
}
