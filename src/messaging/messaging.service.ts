import { Injectable, BadRequestException } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { WhatsappService } from 'services/wppconnect/whatsapp.service';
import { PrismaService } from '@utils/prisma/prisma.service';
import { ConnectDto } from './dto/connect.dto';
import {
  PREFIX_WPP_SESSION_NAME,
  WHATSAPP_SESSION_STATUS,
} from '@utils/globals/constants';

@Injectable()
export class MessagingService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {}

  async connectSession(dto: ConnectDto) {
    const { identification } = dto;
    const session_name = `${PREFIX_WPP_SESSION_NAME}${identification}`;

    await this.prisma.whatsappSession.upsert({
      where: { session_name },
      update: {},
      create: {
        identification,
        session_name,
      },
    });

    await this.whatsappService.initClient(session_name, identification);
    return { success: true, message: 'QR generado' };
  }

  async getStatus(identification: number) {
    const session = await this.prisma.whatsappSession.findFirst({
      where: { identification },
    });

    if (!session)
      return {
        session_state: WHATSAPP_SESSION_STATUS.NOT_LOGGED,
      };

    return session;
  }

  async sendMessage(dto: SendMessageDto) {
    const session_name = `${PREFIX_WPP_SESSION_NAME}${dto.identification}`;
    const session = await this.prisma.whatsappSession.findUnique({
      where: { session_name },
    });

    if (!session || session.session_state !== WHATSAPP_SESSION_STATUS.IN_CHAT) {
      throw new Error('Whatsapp no habilitado o sesión no conectada.');
    }

    return this.whatsappService.sendMessage(session_name, dto);
  }
}
