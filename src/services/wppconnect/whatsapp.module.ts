import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { MessagingGateway } from 'sockets/messaging.gateway';

@Module({
  providers: [WhatsappService, MessagingGateway],
  exports: [WhatsappService],
})
export class WhatsappModule {}
