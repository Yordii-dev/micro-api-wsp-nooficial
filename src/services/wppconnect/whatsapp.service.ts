import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  FOLDER_WPP_SESSIONS,
  WHATSAPP_SESSION_STATUS,
} from '@utils/globals/constants';
import { PrismaService } from '@utils/prisma/prisma.service';
import * as wppconnect from '@wppconnect-team/wppconnect';
import { existsSync } from 'fs';
import { SendMessageDto } from 'messaging/dto/send-message.dto';
import { MessagingGateway } from 'sockets/messaging.gateway';
import { extractPhoneFromWid } from './utils/extract-phone';
import { WhatsappSession } from '@prisma/client';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private clients = new Map<string, any>();

  constructor(
    private prisma: PrismaService,
    private gateway: MessagingGateway,
  ) {}

  //se ejecuta al iniciar el módulo
  async onModuleInit() {
    console.log('Iniciando WhatsappService...');

    this.bootstrapClients().catch((err) => console.error(err));
  }

  async bootstrapClients() {
    const sessions = await this.prisma.whatsappSession.findMany({
      where: { status: true },
    });

    for (const s of sessions) {
      const folderExists = existsSync(
        `${FOLDER_WPP_SESSIONS}/${s.session_name}`,
      );
      if (folderExists) {
        await this.initClient(s.session_name, s.identification);
      }
    }
  }

  async initClient(session_name: string, identification: number) {
    if (this.clients.has(session_name)) return;

    const client = await wppconnect.create({
      session: session_name,
      folderNameToken: `${FOLDER_WPP_SESSIONS}`,
      autoClose: 0,
      puppeteerOptions: {
        headless: true,
        args: ['--no-sandbox'],
        userDataDir: `${FOLDER_WPP_SESSIONS}/${session_name}`,
      },

      // Cuando genera QR
      catchQR: async (base64Qr) => {
        await this.prisma.whatsappSession.update({
          where: { session_name },
          data: { session_state: 'qrGenerated' },
        });

        this.gateway.emitQR(identification, base64Qr);

        console.log('QR enviado al frontend:', identification);
      },

      statusFind: async (status) => {
        let whatsapp_session: WhatsappSession | undefined;
        if (
          status === WHATSAPP_SESSION_STATUS.QR_SCANNED ||
          status === WHATSAPP_SESSION_STATUS.IN_CHAT
        ) {
          const wid = await client.getWid();
          const phone = extractPhoneFromWid(wid);

          whatsapp_session = await this.prisma.whatsappSession.update({
            where: { session_name },
            data: {
              session_state: status,
              phone,
            },
          });
        } else {
          whatsapp_session = await this.prisma.whatsappSession.update({
            where: { session_name },
            data: { session_state: status },
          });
        }

        this.gateway.emitStatus(identification, whatsapp_session);
      },
    });

    this.clients.set(session_name, client);
  }

  async sendMessage(session_name: string, dto: SendMessageDto) {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { session_name },
    });

    if (!session) throw new Error('Sesión no encontrada');
    if (session.session_state !== 'inChat')
      throw new Error('Sesión no conectada');

    const client = this.clients.get(session_name);
    if (!client) throw new Error('Cliente no conectado en runtime');

    const to = dto.destination.replace(/\D/g, '') + '@c.us';
    return client.sendText(to, dto.message);
  }
}
