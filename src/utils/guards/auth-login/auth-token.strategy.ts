import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SUBJECTS_JWT } from '@utils/globals/constants';

@Injectable()
export class AuthTokenStrategy extends PassportStrategy(
  Strategy,
  SUBJECTS_JWT.auth_token,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (payload.sub !== SUBJECTS_JWT.auth_token) {
      throw new UnauthorizedException('Token inválido para este recurso');
    }
    return payload;
  }
}
