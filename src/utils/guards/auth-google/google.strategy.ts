import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { SUBJECTS_JWT } from '@utils/globals/constants';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  SUBJECTS_JWT.oauth_google,
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth-landing-google/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails, name, photos } = profile;

    return {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos?.[0]?.value,
      provider: 'google',
    };
  }
}
