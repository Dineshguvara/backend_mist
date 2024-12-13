import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from 'src/authentication/decorators/auth.decorators';
import { AuthType } from 'src/authentication/enums/auth-type.enum';
import { RoleEntity } from './entities/role.entity';
import { ActiveUser } from 'src/authentication/decorators/active-user.decorators';
import { SuperAdminOnly } from 'src/authentication/decorators/roles/super-admin-only.decoratot';

@Auth(AuthType.Bearer)
@ApiBearerAuth()
@ApiTags('roles') // This groups the Role endpoints in Swagger
@SuperAdminOnly()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiCreatedResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Create a new role' })
  createRole(
    @ActiveUser('sub') userId: number,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    console.log('Active User ID:', userId); // Debug log
    return this.rolesService.createRole(userId, createRoleDto);
  }

  @Get()
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  @ApiOperation({ summary: 'Get all roles' })
  findAllRole() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @ApiOkResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Get a role by ID' })
  findOneRole(@Param('id') id: string) {
    return this.rolesService.findOneRole(+id);
  }

  @Auth(AuthType.None)
  @Get('role-register/:id')
  @ApiOkResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Get a role by ID' })
  showOneRole(@Param('id') id: string) {
    return this.rolesService.findOneRole(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Update a role by ID' })
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RoleEntity })
  @ApiOperation({ summary: 'Delete a role by ID' })
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(+id);
  }
}
