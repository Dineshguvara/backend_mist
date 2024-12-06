// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthenticationService } from './authentication.service';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { JwtService } from '@nestjs/jwt';
// import { RolesService } from 'src/administration/roles/roles.service';
// import { UsersService } from 'src/administration/users/users.service';
// import {
//   ConflictException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { CreateSuperAdminDto } from 'src/super-admins/dto/create-super-admin.dto';
// import { CreateUserDto } from 'src/administration/users/dto/create-user.dto';

// // Mock dependencies
// const mockPrismaService = {
//   $transaction: jest.fn(),
//   user: {
//     create: jest.fn(),
//   },
//   superAdmin: {
//     create: jest.fn(),
//   },
// };

// const mockJwtService = {
//   signAsync: jest.fn(),
// };

// const mockRolesService = {};
// const mockUsersService = {};

// // Mock configuration provider for jwt
// const mockConfigurationProvider = {
//   provide: 'CONFIGURATION(jwt)',
//   useValue: {
//     secret: 'mockSecretKey',
//     expiresIn: '1h',
//   },
// };

// describe('AuthenticationService', () => {
//   let authService: AuthenticationService;
//   let prismaService: PrismaService;
//   let jwtService: JwtService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthenticationService,
//         { provide: PrismaService, useValue: mockPrismaService },
//         { provide: JwtService, useValue: mockJwtService },
//         { provide: RolesService, useValue: mockRolesService },
//         { provide: UsersService, useValue: mockUsersService },
//         mockConfigurationProvider, // Add the mock configuration provider
//       ],
//     }).compile();

//     authService = module.get<AuthenticationService>(AuthenticationService);
//     prismaService = module.get<PrismaService>(PrismaService);
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(authService).toBeDefined();
//   });

//   describe('register', () => {
//     it.only('should successfully register a user and generate tokens', async () => {
//       // Mocking the user creation and related data
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password',
//         roleId: 1,
//       };
//       const mockUser = {
//         id: 1,
//         email: 'test@example.com',
//         role: { name: 'super_admin', id: 1 },
//       };
//       const mockSuperAdminDto: CreateSuperAdminDto = {
//         name: 'Super Admin',
//         userId: 1,
//       };

//       mockPrismaService.$transaction.mockResolvedValueOnce(mockUser);
//       mockPrismaService.user.create.mockResolvedValueOnce(mockUser);
//       mockPrismaService.superAdmin.create.mockResolvedValueOnce(undefined);
//       mockJwtService.signAsync.mockResolvedValue('mockAccessToken');

//       // Calling the register method
//       const result = await authService.register(
//         createUserDto,
//         mockSuperAdminDto,
//       );

//       // Verifying the expected outcome
//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('refreshToken');
//       expect(mockPrismaService.$transaction).toHaveBeenCalled();
//       expect(mockJwtService.signAsync).toHaveBeenCalledWith(
//         expect.objectContaining({
//           sub: mockUser.id,
//           email: mockUser.email,
//           roleId: mockUser.role.id,
//           roleName: mockUser.role.name,
//         }),
//         expect.any(Object),
//       );
//     });

//     it('should throw ConflictException when role is invalid', async () => {
//       // Mocking user with no role
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password',
//         roleId: 1,
//       };
//       const mockUser = { id: 1, email: 'test@example.com', role: null };

//       mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

//       await expect(authService.register(createUserDto)).rejects.toThrow(
//         ConflictException,
//       );
//     });

//     it('should throw InternalServerErrorException if there is an error in the transaction', async () => {
//       // Simulate error during transaction
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password',
//         roleId: 1,
//       };

//       mockPrismaService.$transaction.mockRejectedValueOnce(
//         new Error('Database error'),
//       );

//       await expect(authService.register(createUserDto)).rejects.toThrow(
//         InternalServerErrorException,
//       );
//     });

//     it('should throw ConflictException when superAdminDto is missing for super_admin role', async () => {
//       // Simulating missing superAdminDto for super_admin role
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password',
//         roleId: 1,
//       };
//       const mockUser = {
//         id: 1,
//         email: 'test@example.com',
//         role: { name: 'super_admin' },
//       };

//       mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

//       await expect(authService.register(createUserDto)).rejects.toThrow(
//         ConflictException,
//       );
//     });
//   });
// });
