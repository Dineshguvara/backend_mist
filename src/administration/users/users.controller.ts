import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { ActiveUser } from 'src/authentication/decorators/active-user.decorators';
import { Auth } from 'src/authentication/decorators/auth.decorators';
import { AuthType } from 'src/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@ApiBearerAuth()
@ApiTags('users') // This groups the User endpoints in Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // ------------------------------------------------------------------
  //    FIND ALL USER CONTROLLER
  // ------------------------------------------------------------------
  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @ApiOperation({ summary: 'Get all users' })
  findAllUser() {
    return this.userService.findAllUser();
  }

  // ------------------------------------------------------------------
  //   FIND BY ID CONTROLLER
  // ------------------------------------------------------------------

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Get a user by ID' })
  findUserById(@ActiveUser('sub') userId: number) {
    return this.userService.findUserById(userId);
  }

  // ------------------------------------------------------------------
  //   UPDATE USER CONTROLLER
  // ------------------------------------------------------------------

  @Put(':id')
  @ApiOkResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Update a user by ID' })
  updateUser(
    @ActiveUser('sub') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }
}
