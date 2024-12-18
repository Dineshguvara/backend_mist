import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { DummyDataService } from './dummy-data.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Auth } from '../decorators/auth.decorators';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@ApiTags('Dummy Data') // Add this to group your API endpoints in Swagger
@Controller('dummy-data')
export class DummyDataController {
  constructor(private readonly dummyDataService: DummyDataService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data') // Tell Swagger the endpoint accepts form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Indicates a file upload
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // Allow up to 5MB
      },
      storage: diskStorage({
        destination: './uploads/excelSheet',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
          console.log(
            'Inside DISKSTORAGE Backend controller  testing for working',
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          console.log(
            'Inside  FILEFILTER Backen controller testing for working',
          );

          return cb(new BadRequestException('Invalid file format'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('File MIME type from backend :', file.mimetype);
    const { path: filePath, mimetype } = file;
    return this.dummyDataService.uploadDataFromFile(filePath, mimetype);
  }

  @Get()
  async getAllData() {
    return this.dummyDataService.getAllData();
  }
}
