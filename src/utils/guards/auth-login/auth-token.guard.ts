import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SUBJECTS_JWT } from '@utils/globals/constants';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthTokenGuard extends AuthGuard(SUBJECTS_JWT.auth_token) {
  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException(
        'La sesion ha expirado. Inicie sesion nuevamente',
      );
    }
    if (err || !user) {
      throw new UnauthorizedException('Token inválido');
    }
    return user;
  }
}
