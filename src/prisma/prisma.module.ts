import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes this module globally available across the application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
