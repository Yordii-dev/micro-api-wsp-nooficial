// messaging.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  emitQR(userId: number, qrBase64: string) {
    this.server.emit(`qr:${userId}`, qrBase64);
  }

  emitStatus(userId: number, status: string) {
    this.server.emit(`status:${userId}`, status);
  }
}
