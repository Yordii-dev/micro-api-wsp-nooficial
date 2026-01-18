import { Controller, Get, UseGuards } from '@nestjs/common';
import { MastersService } from './masters.service';
import { AuthTokenGuard } from '@utils/guards/auth-login/auth-token.guard';
import type { AuthTokenPayload } from '@utils/interfaces/jwt/auth-token';
import { AuthToken } from '@utils/decorators/auth-token.decorator';

@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  async getAll(@AuthToken() userAuth: AuthTokenPayload) {
    const roles = await this.mastersService.getAll(userAuth);
    return roles;
  }

  @Get('all-roles')
  async getAllRoles() {
    const roles = await this.mastersService.getAllRoles();
    return roles;
  }
}
