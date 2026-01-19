import { Injectable, BadRequestException } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { WhatsappService } from 'services/wppconnect/whatsapp.service';
import { PrismaService } from '@utils/prisma/prisma.service';
import { ConnectDto } from './dto/connect.dto';
import { WHATSAPP_SESSION_STATUS } from '@utils/globals/constants';

@Injectable()
export class MessagingService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {}

  async connectSession(dto: ConnectDto) {
    const { user_id: userId } = dto;
    const sessionName = `user_${userId}`;

    await this.prisma.whatsappSession.upsert({
      where: { sessionName },
      update: {},
      create: {
        userId,
        sessionName,
      },
    });

    await this.whatsappService.initClient(sessionName, userId);
    return { success: true, message: 'QR generado' };
  }

  async getStatus(userId: number) {
    const session = await this.prisma.whatsappSession.findFirst({
      where: { userId },
    });

    return !session ? WHATSAPP_SESSION_STATUS.NOT_LOGGED : session.sessionState;
  }

  async sendMessage(dto: SendMessageDto) {
    const sessionName = `user_${dto.user_id}`;
    const session = await this.prisma.whatsappSession.findUnique({
      where: { sessionName },
    });

    if (!session || session.sessionState !== WHATSAPP_SESSION_STATUS.IN_CHAT) {
      throw new Error('Whatsapp no habilitado o sesión no conectada.');
    }

    return this.whatsappService.sendMessage(sessionName, dto);
  }
}
