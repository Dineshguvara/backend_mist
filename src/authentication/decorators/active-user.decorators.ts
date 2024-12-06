import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../authentication.constants'; // The key where user info is stored
import { ActiveUserData } from '../interfaces/active-user-data.inteface';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];

    // If a field is provided, return that specific field of the user, otherwise return the whole user object
    return field ? user?.[field] : user;
  },
);
