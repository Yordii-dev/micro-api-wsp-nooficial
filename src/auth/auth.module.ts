import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@utils/prisma/prisma.service';
import { SUBJECTS_JWT } from '@utils/globals/constants';
import { AuthTokenStrategy } from '@utils/guards/auth-login/auth-token.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d', subject: SUBJECTS_JWT.auth_token }, //Valores default si en signAsync no se definen
    }),
  ],
  providers: [PrismaService, AuthTokenStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
