import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuperAdminsService } from './super-admins.service';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { SuperAdminEntity } from './entities/super-admin.entity';
import { ActiveUser } from 'src/authentication/decorators/active-user.decorators';
import { Auth } from 'src/authentication/decorators/auth.decorators';
import { AuthType } from 'src/authentication/enums/auth-type.enum';
import { SuperAdminOnly } from 'src/authentication/decorators/roles/super-admin-only.decoratot';

@Auth(AuthType.Bearer)
@ApiBearerAuth()
@ApiTags('super-admins')
@SuperAdminOnly()
@Controller('super-admins')
export class SuperAdminsController {
  constructor(private readonly superAdminsService: SuperAdminsService) {}

  @Get()
  @ApiOkResponse({ type: SuperAdminEntity, isArray: true })
  @ApiOperation({ summary: 'Get all Super admins' })
  findAllProfile() {
    return this.superAdminsService.findAllProfile();
  }

  @Get(':id')
  @ApiOkResponse({ type: SuperAdminEntity })
  @ApiOperation({ summary: 'Get a Super admin by ID' })
  getMyProfile(@ActiveUser('sub') userId: number) {
    return this.superAdminsService.getMyProfile(userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SuperAdminEntity })
  @ApiOperation({ summary: 'Update a Super admin by ID' })
  updateMyProfile(
    @ActiveUser('sub') userId: number,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
  ) {
    return this.superAdminsService.updateMyProfile(userId, updateSuperAdminDto);
  }
}
