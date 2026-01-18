import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayload } from '@utils/interfaces/jwt/auth-token';

export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthTokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
