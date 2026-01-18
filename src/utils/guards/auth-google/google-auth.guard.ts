import { Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { SUBJECTS_JWT } from '@utils/globals/constants';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(SUBJECTS_JWT.oauth_google) {}
