import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { REQUEST_USER_KEY } from 'src/authentication/authentication.constants';
import jwtConfig from 'src/authentication/config/jwt.config';
import { Request } from 'express';
import { UsersService } from 'src/administration/users/users.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
 
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      const user = await this.userService.findUserById(payload.sub);

      if (!user || !user.role) {
        throw new UnauthorizedException('User role not found.');
      }

      // Attach user data with role name to the request
      request[REQUEST_USER_KEY] = { ...payload, role: user.role.name };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
