import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { SendMessageDto } from 'messaging/dto/send-message.dto';
import { MessagingGateway } from 'sockets/messaging.gateway';
import { bootstrapClients } from './utils/bootstrap-clients';
import { WHATSAPP_SESSION_STATUS } from '@utils/globals/constants';
import { cleanChromiumLocks } from './utils/clear-chromium-locks';
import * as wppconnect from '@wppconnect-team/wppconnect';
import { baseConfigWpp } from './utils/base-config-wpp';
import { SessionManager } from './utils/session-manager';

@Injectable()
export class WhatsappService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private gateway: MessagingGateway,
    private sessionManager: SessionManager,
  ) {}

  //se ejecuta al iniciar el api
  async onModuleInit() {
    console.log('Iniciando WhatsappService...');
    // uso catch para que no bloquee el arranque del servidor
    bootstrapClients(this.prisma, this.initClient.bind(this)).catch((err) =>
      console.error(err),
    );
  }

  async initClient(session_name: string, identification: number) {
    // if (this.sessionManager.has(session_name)) return;
    const existing = this.sessionManager.get(session_name);

    if (existing) {
      try {
        await existing.close();
      } catch {}
      this.sessionManager.remove(session_name);
    }

    cleanChromiumLocks(session_name);

    try {
      const client = await wppconnect.create({
        ...baseConfigWpp(session_name),

        catchQR: async (qr) => {
          const session = await this.prisma.whatsappSession.update({
            where: { session_name },
            data: { session_state: 'qrGenerated' },
          });

          this.gateway.emitQR(identification, qr);
          // this.gateway.emitStatus(identification, session);
        },

        statusFind: async (status) => {
          // ❗ aquí NO usamos client
          const session = await this.prisma.whatsappSession.update({
            where: { session_name },
            data: { session_state: status },
          });

          this.gateway.emitStatus(identification, session);
        },
      });

      // 🔑 recién aquí el client existe
      this.sessionManager.set(session_name, client);

      await this.onClientReady(session_name, identification, client);
      await this.registerEvents(session_name, identification, client);
    } catch (error) {
      console.error('INIT CLIENT ERROR', error);
    }
  }
  async onClientReady(
    session_name: string,
    identification: number,
    client: any,
  ) {
    try {
      const wid = await client.getWid();
      const phone = wid.split('@')[0];

      const session = await this.prisma.whatsappSession.update({
        where: { session_name },
        data: {
          phone,
          session_state: 'inChat',
          status: true,
        },
      });

      this.gateway.emitStatus(identification, session);
    } catch (err) {
      console.log('cliente aún no listo');
    }
  }
  registerEvents(session_name: string, identification: number, client: any) {
    client.onStateChange(async (state) => {
      console.log(`STATE ${session_name}`, state);

      if (state === 'CONFLICT') {
        await client.useHere();
      }

      if (state === 'UNPAIRED') {
        this.sessionManager.remove(session_name);
        try {
          await client.close(); // 🔴 cerrar chromium
        } catch {}

        const session = await this.prisma.whatsappSession.update({
          where: { session_name },
          data: {
            session_state: WHATSAPP_SESSION_STATUS.DISCONNECTED,
            status: false,
          },
        });

        this.gateway.emitStatus(identification, session);
      }
    });
  }

  // async sendMessage(session_name: string, dto: SendMessageDto) {
  //   const session = await this.prisma.whatsappSession.findUnique({
  //     where: { session_name },
  //   });

  //   if (!session) throw new Error('Sesión no encontrada');
  //   if (session.session_state !== 'inChat')
  //     throw new Error('Sesión no conectada');

  //   let client = clients.get(session_name);
  //   if (!client) {
  //     await this.initClient(session_name, session.identification);
  //     client = clients.get(session_name);
  //   }
  //   if (!client) throw new Error('Cliente no conectado en runtime');

  //   const to = dto.destination.replace(/\D/g, '') + '@c.us';
  //   return client.sendText(to, dto.message);
  // }

  async sendMessage(session_name: string, dto: SendMessageDto) {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { session_name },
    });

    if (!session) throw new Error('Sesión no encontrada');

    if (session.session_state !== 'inChat')
      throw new Error('Sesión no conectada');

    let client = this.sessionManager.get(session_name);

    if (!client) {
      await this.initClient(session_name, session.identification);

      client = this.sessionManager.get(session_name);
    }

    if (!client) throw new Error('Cliente no conectado');

    const to = dto.destination.replace(/\D/g, '') + '@c.us';

    return client.sendText(to, dto.message);
  }
}
