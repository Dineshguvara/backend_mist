// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import {  RefreshToken } from '@prisma/client';

// @Injectable()
// export class RefreshTokenService {
//   constructor(private readonly prisma: PrismaService) {}

//   // Create a refresh token
//   async create(
//     userId: number,
//     refreshTokenId: string,
//     expiresAt: Date,
//   ): Promise<RefreshToken> {
//     return this.prisma.refreshToken.create({
//       data: {
//         userId,
//         refreshTokenId,
//         expiresAt,
//       },
//     });
//   }

//   // Find a refresh token by its ID
//   async findByTokenId(refreshTokenId: string): Promise<RefreshToken | null> {
//     return this.prisma.refreshToken.findFirst({
//       where: { refreshTokenId },
//     });
//   }

//   // Invalidate (delete) a refresh token by its ID
//   async invalidate(refreshTokenId: string): Promise<void> {
//     await this.prisma.refreshToken.deleteMany({
//       where: { refreshTokenId },
//     });
//   }

//   // Invalidate all refresh tokens for a user (for logout functionality)
//   async invalidateAllForUser(userId: number): Promise<void> {
//     await this.prisma.refreshToken.deleteMany({
//       where: { userId },
//     });
//   }
// }
