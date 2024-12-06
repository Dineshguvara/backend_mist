import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';

import { SendEmailDto } from './dto/send-email.dto'; // DTO for email data
import { MailService } from './e-mail.service';
import { Auth } from '../decorators/auth.decorators';
import { AuthType } from '../enums/auth-type.enum';

 @Auth(AuthType.None)
 @ApiTags('mail')
 @Controller('mail')
 export class MailController {
   constructor(private readonly mailService: MailService) {}

   @ApiBearerAuth() // Require authentication if necessary
   @HttpCode(HttpStatus.OK)
   @Post('send-invitation')
   @ApiCreatedResponse({ description: 'Invitation email sent successfully' })
   sendInviEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.mailService.sendInviEmail(sendEmailDto);
   }
 }
