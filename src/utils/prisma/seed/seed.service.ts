import { Injectable } from '@nestjs/common';
import { ROLES } from './data/data';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeedService {
  JWT_SALT = 10;
  constructor(private prisma: PrismaService) {}

  //MASTERS

  async run() {}
}
