// messaging.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WhatsappSession } from '@prisma/client';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  emitQR(identification: number, qrBase64: string) {
    this.server.emit(`qr:${identification}`, qrBase64);
  }

  emitStatus(identification: number, whatsapp_session: WhatsappSession) {
    this.server.emit(`status:${identification}`, whatsapp_session);
  }
}
