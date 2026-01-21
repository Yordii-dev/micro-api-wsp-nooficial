import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import * as wppconnect from '@wppconnect-team/wppconnect';
import { existsSync } from 'fs';
import { SendMessageDto } from 'messaging/dto/send-message.dto';
import { MessagingGateway } from 'sockets/messaging.gateway';

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
      const folderExists = existsSync(`./wpp-sessions/${s.sessionName}`);
      if (folderExists) {
        await this.initClient(s.sessionName, s.userId);
      }
    }
  }

  async initClient(sessionName: string, userId: number) {
    if (this.clients.has(sessionName)) return;

    const client = await wppconnect.create({
      session: sessionName,
      folderNameToken: './wpp-sessions',
      autoClose: 0,
      puppeteerOptions: {
        headless: true,
        args: ['--no-sandbox'],
        userDataDir: `./wpp-sessions/${sessionName}`,
      },

      // Cuando genera QR
      catchQR: async (base64Qr) => {
        await this.prisma.whatsappSession.update({
          where: { sessionName },
          data: { sessionState: 'qrGenerated' },
        });

        this.gateway.emitQR(userId, base64Qr);

        console.log('QR enviado al frontend:', userId);
      },

      // Estado de la sesión: notLogged, qrReadSuccess, inChat
      statusFind: async (status) => {
        await this.prisma.whatsappSession.update({
          where: { sessionName },
          data: { sessionState: status },
        });

        this.gateway.emitStatus(userId, status);
      },
    });

    this.clients.set(sessionName, client);
  }

  async sendMessage(sessionName: string, dto: SendMessageDto) {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { sessionName },
    });

    if (!session) throw new Error('Sesión no encontrada');
    if (session.sessionState !== 'inChat')
      throw new Error('Sesión no conectada');

    const client = this.clients.get(sessionName);
    if (!client) throw new Error('Cliente no conectado en runtime');

    const to = dto.destino.replace(/\D/g, '') + '@c.us';
    return client.sendText(to, dto.mensaje);
  }
}
