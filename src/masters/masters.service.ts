import { Injectable } from '@nestjs/common';
import { AuthTokenPayload } from '@utils/interfaces/jwt/auth-token';
import { PrismaService } from '@utils/prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userAuth: AuthTokenPayload) {
    return userAuth.id;
  }

  async getAllRoles() {
    return this.prismaService.role.findMany(); //
  }
}
