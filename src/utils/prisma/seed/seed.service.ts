import { Injectable } from '@nestjs/common';
import { ROLES } from './data/data';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeedService {
  JWT_SALT = 10;
  constructor(private prisma: PrismaService) {}

  //MASTERS
  async setRoles() {
    for (const role of Object.values(ROLES)) {
      await this.prisma.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role },
      });
    }
  }

  async run() {
    await this.setRoles();
  }
}
