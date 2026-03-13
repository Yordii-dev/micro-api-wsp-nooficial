import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { MessagingGateway } from 'sockets/messaging.gateway';
import { SessionManager } from './utils/session-manager';

@Module({
  providers: [WhatsappService, MessagingGateway, SessionManager],
  exports: [WhatsappService],
})
export class WhatsappModule {}
