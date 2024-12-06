import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient {}
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // Ensure the Prisma client connects when the module is initialized
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Ensure the Prisma client disconnects when the module is destroyed
  }
}
