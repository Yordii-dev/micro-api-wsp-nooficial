import { Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { ConnectDto } from './dto/connect.dto';
import { PrismaService } from '@utils/prisma/prisma.service';
import { MessagingGateway } from 'sockets/messaging.gateway';
import {
  PREFIX_WPP_SESSION_NAME,
  WHATSAPP_SESSION_STATUS,
} from '@utils/globals/constants';
import { EvolutionApiService } from 'services/evolution/evolution.service';
import { EvolutionWebhookDto } from './dto/evolution-webhook.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly evolutionApi: EvolutionApiService,
    private readonly prisma: PrismaService,
    private readonly gateway: MessagingGateway,
  ) {}

  // ─── Conectar sesión ────────────────────────────────────────────────────────

  // async connectSession(dto: ConnectDto) {
  //   const { identification } = dto;
  //   const session_name = `${PREFIX_WPP_SESSION_NAME}${identification}`;

  //   // Asegurar registro en BD
  //   await this.prisma.whatsappSession.upsert({
  //     where: { session_name },
  //     update: {},
  //     create: { identification, session_name },
  //   });

  //   // Conectar en Evolution API (no bloqueante)
  //   this.evolutionApi
  //     .connectInstance(session_name, identification)
  //     .then(({ qrcode }) => {
  //       if (qrcode) {
  //         // Si hay QR inmediato lo emitimos (raro; normalmente llega por webhook)
  //         this.gateway.emitQR(identification, qrcode);
  //       }
  //     })
  //     .catch((err) => this.logger.error('connectSession error', err));

  //   return { success: true };
  // }
  async connectSession(dto: ConnectDto) {
    const { identification } = dto;
    const session_name = `${PREFIX_WPP_SESSION_NAME}${identification}`;

    await this.prisma.whatsappSession.upsert({
      where: { session_name },
      update: {},
      create: { identification, session_name },
    });

    // El QR llega por webhook, no hay nada que manejar aquí
    this.evolutionApi
      .connectInstance(session_name, identification)
      .catch((err) => this.logger.error('connectSession error', err));

    return { success: true };
  }
  // ─── Estado ─────────────────────────────────────────────────────────────────

  async getStatus(identification: number) {
    const session = await this.prisma.whatsappSession.findFirst({
      where: { identification },
    });

    if (!session) return { session_state: WHATSAPP_SESSION_STATUS.NOT_LOGGED };

    return session;
  }

  // ─── Enviar mensaje ──────────────────────────────────────────────────────────

  async sendMessage(dto: SendMessageDto) {
    const session_name = `${PREFIX_WPP_SESSION_NAME}${dto.identification}`;

    const session = await this.prisma.whatsappSession.findUnique({
      where: { session_name },
    });

    if (!session || session.session_state !== WHATSAPP_SESSION_STATUS.IN_CHAT) {
      throw new Error('WhatsApp no habilitado o sesión no conectada.');
    }

    return this.evolutionApi.sendText(
      session_name,
      dto.destination,
      dto.message,
    );
  }

  // ─── Webhook de Evolution API ────────────────────────────────────────────────

  /**
   * Recibe los eventos que Evolution API POST-ea a /messaging/webhook.
   * Eventos relevantes:
   *   - QRCODE_UPDATED   → emitir QR al frontend del cliente
   *   - CONNECTION_UPDATE → actualizar estado en BD y notificar por socket
   */
  // async handleWebhook(dto: EvolutionWebhookDto) {
  //   const { event, instance: session_name, data } = dto;

  //   // Recuperar identification desde la sesión en BD
  //   const session = await this.prisma.whatsappSession.findUnique({
  //     where: { session_name },
  //   });

  //   if (!session) {
  //     this.logger.warn(
  //       `Webhook ignorado: sesión no encontrada → ${session_name}`,
  //     );
  //     return;
  //   }

  //   const { identification } = session;

  //   switch (event) {
  //     case 'QRCODE_UPDATED': {
  //       const qrBase64: string | undefined = data?.qrcode?.base64;
  //       if (!qrBase64) break;

  //       const updated = await this.prisma.whatsappSession.update({
  //         where: { session_name },
  //         data: { session_state: WHATSAPP_SESSION_STATUS.QR_GENERATED },
  //       });

  //       this.gateway.emitQR(identification, qrBase64);
  //       this.gateway.emitStatus(identification, updated);
  //       break;
  //     }

  //     case 'CONNECTION_UPDATE': {
  //       const state: string | undefined = data?.state; // 'open' | 'close' | 'connecting'

  //       if (state === 'open') {
  //         // Sesión conectada — obtener el número de teléfono
  //         const phone = this.extractPhone(data?.instance?.owner ?? '');

  //         const updated = await this.prisma.whatsappSession.update({
  //           where: { session_name },
  //           data: {
  //             session_state: WHATSAPP_SESSION_STATUS.IN_CHAT,
  //             phone: phone || session.phone,
  //             status: true,
  //           },
  //         });

  //         this.gateway.emitStatus(identification, updated);
  //       } else if (state === 'close') {
  //         const updated = await this.prisma.whatsappSession.update({
  //           where: { session_name },
  //           data: {
  //             session_state: WHATSAPP_SESSION_STATUS.DISCONNECTED,
  //             status: false,
  //           },
  //         });

  //         this.gateway.emitStatus(identification, updated);
  //       } else {
  //         // 'connecting' u otros estados intermedios
  //         const updated = await this.prisma.whatsappSession.update({
  //           where: { session_name },
  //           data: { session_state: state },
  //         });

  //         this.gateway.emitStatus(identification, updated);
  //       }
  //       break;
  //     }

  //     default:
  //       this.logger.debug(`Webhook evento no manejado: ${event}`);
  //   }
  // }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  async handleWebhook(dto: any) {
    // Evolution v2 usa "connection.update" y "qrcode.updated" (con punto, minúscula)
    const event: string = dto?.event ?? '';
    const session_name: string = dto?.instance;
    const data = dto?.data;

    const session = await this.prisma.whatsappSession.findUnique({
      where: { session_name },
    });

    if (!session) {
      this.logger.warn(
        `Webhook ignorado: sesión no encontrada → ${session_name}`,
      );
      return;
    }

    const { identification } = session;

    if (event === 'qrcode.updated' || event === 'QRCODE_UPDATED') {
      const qrBase64: string | undefined = data?.qrcode?.base64;
      if (!qrBase64) return;

      const updated = await this.prisma.whatsappSession.update({
        where: { session_name },
        data: { session_state: WHATSAPP_SESSION_STATUS.QR_GENERATED },
      });

      this.gateway.emitQR(identification, qrBase64);
      this.gateway.emitStatus(identification, updated);
    } else if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      const state: string = data?.state;

      if (state === 'open') {
        // const phone = this.extractPhone(data?.instance?.owner ?? '');
        const phone = this.extractPhone(
          data?.wuid ?? data?.instance?.owner ?? '',
        );

        const updated = await this.prisma.whatsappSession.update({
          where: { session_name },
          data: {
            session_state: WHATSAPP_SESSION_STATUS.IN_CHAT,
            phone: phone || session.phone,
            status: true,
          },
        });
        this.gateway.emitStatus(identification, updated);
      } else if (state === 'close') {
        const updated = await this.prisma.whatsappSession.update({
          where: { session_name },
          data: {
            session_state: WHATSAPP_SESSION_STATUS.DISCONNECTED,
            status: false,
          },
        });
        this.gateway.emitStatus(identification, updated);
      } else if (state === 'connecting') {
        // Estado transitorio — solo actualizar BD, no emitir socket
        await this.prisma.whatsappSession.update({
          where: { session_name },
          data: { session_state: state },
        });
      }
    } else {
      this.logger.debug(`Webhook evento no manejado: ${event}`);
    }
  }
  /** Extrae el número desde un JID de WhatsApp → "5491155556666@s.whatsapp.net" → "5491155556666" */
  private extractPhone(owner: string): string {
    return owner?.split('@')[0] ?? '';
  }
}
